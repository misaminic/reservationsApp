import { useState, useEffect, useContext } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import MsgModal from '../components/MsgModal';
import _, { slice } from 'lodash';
import styles from '../styles/Home.module.css';
import tables from '../amountOfTables';
import DateAdapter from '@mui/lab/AdapterDateFns';
import DateTimePicker from '@mui/lab/DateTimePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import TextField from '@mui/material/TextField';
import MobileTimePicker from '@mui/lab/MobileTimePicker';
import DesktopTimePicker from '@mui/lab/DesktopTimePicker';
import Stack from '@mui/material/Stack';
import { format, areIntervalsOverlapping, addHours } from 'date-fns';
import { useAppContext } from '../context/AppContext';

const Home: NextPage = () => {
  // using app context
  const { showTableAvailabilityMsg, listOfAllTables, updateListOfAllTables } =
    useAppContext();

  const [allTables, setAllTables] = useState(listOfAllTables);

  const [numberOfPeople, setNumberOfPeople] = useState(2);

  const [tableBookedByTableNumber, setTableBookedByTableNumber] = useState('');
  const [currentTableReserved, setCurrentTableReserved] = useState({});
  const [reservedTables, setReservedTables] = useState([]);
  const [suitableTableSize, setSuitableTableSize] = useState([]);

  const [makeTableAvailableNumber, setMakeTableAvailableNumber] = useState();
  const [makeTableAvailableHour, setMakeTableAvailableHour] = useState();

  const [date, setDate] = useState(new Date('2020-07-19 18:32:00'));

  const [arrivingTime, setArrivingTime] = useState(
    new Date('2020-07-19 18:32:00')
  );

  const [arrivingTimeAsString, setArrivingTimeAsString] = useState('');

  const [leavingTime, setLeavingTime] = useState(
    new Date('2020-07-19 18:42:00')
  );

  const [timeStartEndUserInput, setTimeStartEndUserInput] = useState({});

  const [isName, setIsName] = useState('');
  const [isEmail, setIsEmail] = useState('');

  useEffect(() => {
    setTimeStartEndUserInput({ start: arrivingTime, end: leavingTime });
    setArrivingTimeAsString(format(arrivingTime, 'H:mm'));
  }, [arrivingTime, leavingTime]);

  useEffect(() => {
    console.log(currentTableReserved?.id, 'iz efekta trenutni sto');
    if (currentTableReserved?.id) {
      const reservedTablesWithoutFalsyValues = reservedTables.filter(
        (table) => table !== Boolean
      );

      const reservedTablesDbReady = reservedTablesWithoutFalsyValues.filter(
        (table) => {
          return table?.id !== currentTableReserved?.id;
        }
      );

      setReservedTables([...reservedTablesDbReady, currentTableReserved]);
    }
  }, [currentTableReserved]);

  useEffect(() => {
    if (numberOfPeople === 1) {
      const getAllTablesForTheSizeOfGroup = allTables.filter((item) => {
        return item.key === 2;
      });
      setSuitableTableSize(getAllTablesForTheSizeOfGroup);
    } else if (numberOfPeople === 3) {
      const getAllTablesForTheSizeOfGroup = allTables.filter((item) => {
        return item.key === 4;
      });
      setSuitableTableSize(getAllTablesForTheSizeOfGroup);
    } else {
      const getAllTablesForTheSizeOfGroup = allTables.filter((item) => {
        return item.key === numberOfPeople;
      });

      setSuitableTableSize(getAllTablesForTheSizeOfGroup);
    }
  }, [numberOfPeople]);

  useEffect(() => {
    console.log(reservedTables, 'reserved useEffect');
    console.log(currentTableReserved, 'crt iz zakljucnog USE EFFECT');
    if (currentTableReserved) {
      const currentReservedTableInAllTables = allTables.filter((item) => {
        return item.tables.filter((table) => {
          // console.log(table, ' table u svi stolovi');
          // console.log(table.id, 'table ID');
          // console.log(currentTableReserved?.id, 'crt table ID');
          if (table.id === currentTableReserved?.id) {
            const currentTimeToAddIndex =
              currentTableReserved.reservedTimes.length - 1;

            table?.customers = [
              ...table.customers,
              {
                name: isName,
                email: isEmail,
                time: currentTableReserved?.reservedTimes[
                  currentTimeToAddIndex
                ],
              },
            ];

            table?.reservedTimes = [
              ...table.reservedTimes,
              currentTableReserved?.reservedTimes[currentTimeToAddIndex],
            ];
            // console.log('poklapa se id sa stolom');
            return table;
          }
        });
      });
    }
    // setAllTables(allTables);
    updateListOfAllTables(allTables);
    setIsName('');
    setIsEmail('');
    setCurrentTableReserved({});
    console.log(currentReservedTableInAllTables, 'nadjen sto poslednji UseEff');
    console.log(reservedTables, 'rezervisani poslednji useEff');
    console.log(allTables, 'svi stolovi poslednji useEff');
  }, [reservedTables]);

  // useEffect(() => {
  //   console.log(allTables, 'svi stolovi');
  // }, [allTables]);

  const changeNumberOfPeople = (e) => {
    const operator = e.target.textContent;
    if (numberOfPeople === 1 && operator === '-') {
      setNumberOfPeople(1);
      return;
    } else if (numberOfPeople === 10 && operator === '+') {
      setNumberOfPeople(10);
      return;
    }

    if (operator === '+') {
      setNumberOfPeople(numberOfPeople + 1);
    } else {
      setNumberOfPeople(numberOfPeople - 1);
    }
  };

  const checkTableAvailability = () => {
    // console.log(allTables, 'all tables u checkAvailability');
    // get all tables that are suitable for the entered number of people

    // console.log(suitableTableSize, 'table siz da vidimo');

    // getting all the tables and then each table's reservedTimes property
    // applying time library's function to check if intervals are overlapping
    // this returns array with boolean values, true if they are overlapping

    const allAvailableTablesForGroupSize = suitableTableSize[0].tables.filter(
      (table) => {
        return table.available === true && table;
      }
    );

    console.log(allAvailableTablesForGroupSize, 'SAD svi dostupni');
    const availableTablesOnlyTheOneThatDontHaveCurrentTimeFrame =
      allAvailableTablesForGroupSize.map((table) => {
        // const [timeStartEndFromTable] = table.reservedTimes;

        const timeAlreadyUsed = table.reservedTimes.some((time) => {
          const timeSlotNotResereved = _.isEqual(time, timeStartEndUserInput);

          return timeSlotNotResereved === true;
        });

        return timeAlreadyUsed === false ? table : null;
      });

    // console.log(
    //   availableTablesOnlyTheOneThatDontHaveCurrentTimeFrame,
    //   'da li si dobio potrebni sto'
    // );

    const availableTablesFilteredFromFalsyValues =
      availableTablesOnlyTheOneThatDontHaveCurrentTimeFrame.filter(
        (item) => item !== null
      );

    if (availableTablesFilteredFromFalsyValues.length === 0) {
      showTableAvailabilityMsg(
        true,
        `Ingen ledig bord til ${numberOfPeople} personer klokka ${arrivingTimeAsString}h. Prøv gjerne et annet tidspunkt`
      );
    }

    const availableTablesOnlyTheOneThatDontHaveCurrentTimeFrameAndTimeFramesNotOverlapping =
      availableTablesFilteredFromFalsyValues.map((table) => {
        return table.reservedTimes.map((time) => {
          // console.log(table, 'sto u vremenu');
          const checkIfTimesOverlapping = areIntervalsOverlapping(
            time,
            timeStartEndUserInput,
            {
              inclusive: true,
            }
          );

          return checkIfTimesOverlapping === false ? table : null;
        });
      });

    const availableTablesFiltered =
      availableTablesOnlyTheOneThatDontHaveCurrentTimeFrameAndTimeFramesNotOverlapping.filter(
        (item) => item[0] !== null
      );

    console.log(availableTablesFiltered, 'filtered sad');

    if (availableTablesFiltered.length === 0) {
      showTableAvailabilityMsg(
        true,
        `Ingen ledig bord til ${numberOfPeople} personer klokka ${arrivingTimeAsString}h. Prøv gjerne et annet tidspunkt`
      );

      // setCheckIfBiggerTableSizeAvailable(true);
    }

    // pick table randomly
    const numberOfAvailableTables = availableTablesFiltered.length;

    const randomNumber = Math.floor(
      Math.random() * (numberOfAvailableTables - 0) + 0
    );

    if (availableTablesFiltered.length > 1) {
      setCurrentTableReserved(availableTablesFiltered[randomNumber]);
      console.log(
        availableTablesFiltered[randomNumber]
        // 'available table kad je vise itema'
      );
    } else {
      setCurrentTableReserved(availableTablesFiltered[0]);
      console.log(
        availableTablesFiltered[0]
        // 'available table kad je jedan item'
      );
    }
  };

  const bookTableByTableNumber = () => {
    let tableThatIsBookedByTableNumber = allTables
      .map((tableGroup) => {
        return tableGroup.tables.find((table) => {
          return table.id.toString() === tableBookedByTableNumber;
        });
      })
      .filter((item) => item !== undefined);
    tableThatIsBookedByTableNumber[0]?.available = false;
    console.log(allTables, 'all iz book by number');
    console.log(reservedTables, ' reserved iz book by number');
  };

  const bookTableByTableNumberDateAndTime = () => {
    let tableThatIsBookedByTableNumber = allTables
      .map((tableGroup) => {
        return tableGroup.tables.find((table) => {
          return table.id.toString() === tableBookedByTableNumber;
        });
      })
      .filter((item) => item !== undefined);

    console.log(tableThatIsBookedByTableNumber, 'ovo je sto KOJI TREBA');

    const timeAlreadyUsed =
      tableThatIsBookedByTableNumber[0].reservedTimes.some((time) => {
        console.log(tableThatIsBookedByTableNumber[0], 'TA|LE u SOME');
        console.log(time, 'bookinh tim');
        console.log(timeStartEndUserInput, 'User bookinh tim');
        const timeSlotNotResereved = _.isEqual(time, timeStartEndUserInput);

        return timeSlotNotResereved;
      });
    console.log(timeAlreadyUsed, 'timeAlreadYYYYYY');
    if (timeAlreadyUsed === false) {
      const timesOverlapping =
        tableThatIsBookedByTableNumber[0].reservedTimes.map((time) => {
          // console.log(table, 'sto u vremenu');
          const checkIfTimesOverlapping = areIntervalsOverlapping(
            time,
            timeStartEndUserInput,
            {
              inclusive: true,
            }
          );

          return checkIfTimesOverlapping;
        });

      console.log(timesOverlapping, 'timesOverlapping');

      if (timesOverlapping[0] === false) {
        console.log('usao u time overlAPPPPP');
        setCurrentTableReserved(tableThatIsBookedByTableNumber);
      } else {
        showTableAvailabilityMsg(
          true,
          `Bordet nummer: ${tableThatIsBookedByTableNumber[0].id} er ikke ledig klokka ${arrivingTimeAsString}h. Prøv gjerne et annet tidspunkt`
        );
      }
    } else {
      showTableAvailabilityMsg(
        true,
        `Bordet nummer:${tableThatIsBookedByTableNumber[0].id} er ikke ledig klokka ${arrivingTimeAsString}h. Prøv gjerne et annet tidspunkt`
      );
    }
  };

  const makeTableAvailableFn = () => {
    // getting all tables and finding by Id the one we want to make available
    let tableThatIsAvailableAgain = allTables
      .map((tableGroup) => {
        return tableGroup.tables.find((table) => {
          return table.id.toString() === makeTableAvailableNumber;
        });
      })
      .filter((item) => item !== undefined);

    tableThatIsAvailableAgain[0]?.available = true;

    // getting only first two characters from the string=number=hour entered in the input for cancelling reservation hour
    // const hourToBeRemoved = makeTableAvailableHour.slice(0, 2);

    // looking at the array of hours when table was reserved and removing from it the hours we want table to be available
    // using indexOf to find the number=hour
    // const hoursToBeRemovedFromTheArray =
    //   tableThatIsAvailableAgain[0]?.reservedTimes.indexOf(+hourToBeRemoved);
    // // utilizing splice method to remove two items = first and the second reserved hour
    // if (hoursToBeRemovedFromTheArray > -1) {
    //   tableThatIsAvailableAgain[0]?.reservedTimes.splice(
    //     hoursToBeRemovedFromTheArray,
    //     2
    //   );
    // }
    console.log(reservedTables, 'reserved iz makeAvailable');
    console.log(allTables, 'all iz make available');
  };

  const makeTableAvailableFnByNumberDateTime = () => {};

  const submitNameEmailAndBookTheTable = (e) => {
    e.preventDefault();
    const name = e.target.form[0].value;
    const email = e.target.form[1].value;

    let validationCheck = [];

    const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (email.match(mailFormat)) {
      setIsEmail(email);
      validationCheck.push(true);
    } else {
      validationCheck.push(false);
      showTableAvailabilityMsg(true, 'Sjekk om du har skrevet riktig email');
    }

    if (name === '' || name.length < 2) {
      validationCheck.push(false);
      showTableAvailabilityMsg(true, 'Skriv navnet ditt');
    } else {
      setIsName(name);
      validationCheck.push(true);
    }

    if (_.isEmpty(currentTableReserved)) {
      validationCheck.push(false);
      showTableAvailabilityMsg(true, 'Velg antall personer og tid');
    }

    const dataIsNotValid = validationCheck.some((fieldToValidate) => {
      console.log(fieldToValidate, 'iz soME metode');
      return fieldToValidate === false;
    });

    if (dataIsNotValid === false) {
      if (currentTableReserved[0].reservedTimes.length > 0) {
        console.log(currentTableReserved, 'ovo ti je crt TABLE SAD');
        setCurrentTableReserved({
          ...currentTableReserved[0],

          reservedTimes: [
            ...currentTableReserved[0].reservedTimes,
            timeStartEndUserInput,
          ],
          customers: [
            ...currentTableReserved[0].customers,
            {
              name: isName,
              email: isEmail,
              time: timeStartEndUserInput,
            },
          ],
        });
      } else {
        setCurrentTableReserved({
          ...currentTableReserved[0],

          reservedTimes: [timeStartEndUserInput],
          customers: [
            {
              name: isName,
              email: isEmail,
              time: timeStartEndUserInput,
            },
          ],
        });
      }
    }

    // if there is a table that could be reserved, check for requested hours and if available
    // reserved the table for the specified hours and also add name and email for the reservation
    // if (!currentTableReserved) {
    //   setCurrentTableReserved({
    //     ...currentTableReserved[0],
    //     name: isName,
    //     email: isEmail,
    //     reservedTimes: [timeStartEndUserInput],
    //   });
    // }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Sofias Admin</title>
        <meta name="description" content="Table booking app" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>

      <main className={styles.main}>
        {/* <h1 className={styles.title}>Book a table</h1> */}
        <div className="booking-form">
          <form>
            <div className="form-control text-center">
              <label htmlFor="antall-personer">Antall personer</label>
            </div>

            <div>
              <input
                type="number"
                id="make-table-available__number"
                className="w-12 bg-white rounded text-center m-8"
                value={makeTableAvailableNumber}
                onChange={(e) => setMakeTableAvailableNumber(e.target.value)}
              />
              <input
                type="number"
                id="make-table-available__hour"
                className="w-12 bg-white rounded text-center m-8"
                value={makeTableAvailableHour}
                onChange={(e) => setMakeTableAvailableHour(e.target.value)}
              />
              <button type="button" onClick={() => makeTableAvailableFn()}>
                Make table available
              </button>
            </div>

            <div>
              <input
                type="number"
                id="make-table-available"
                className="w-12 bg-white rounded text-center m-8"
                value={tableBookedByTableNumber}
                onChange={(e) => setTableBookedByTableNumber(e.target.value)}
              />
              <button
                type="button"
                onClick={() => bookTableByTableNumberDateAndTime()}
              >
                Book table by table number
              </button>
            </div>

            <div className="list-of-all-booked-tables">
              <ul>
                {reservedTables.length ? (
                  reservedTables.map((table, index) => {
                    return (
                      table?.id && (
                        <div key={table?.id} className="flex">
                          <li>Table:{table?.id}</li>
                          {table?.reservedTimes?.map((time, index) => {
                            return (
                              <li key={index}>{format(time.start, 'H:mm')}</li>
                            );
                          })}
                        </div>
                      )
                    );
                  })
                ) : (
                  <li>No tables reserved</li>
                )}
              </ul>
            </div>
            <div>
              <LocalizationProvider dateAdapter={DateAdapter}>
                {
                  <Stack spacing={3}>
                    <DateTimePicker
                      label="Velg dato og tid"
                      minDate={new Date()}
                      maxDate={new Date('2021-12-20T21:00')}
                      minTime={new Date(0, 0, 0, 12)}
                      maxTime={new Date(0, 0, 0, 21, 0)}
                      showTodayButton
                      todayText="now"
                      inputFormat="dd/MM/yyyy hh:mm"
                      disablePast
                      openTo="hours"
                      ampm={false}
                      minutesStep={15}
                      value={date}
                      onChange={(date) => {
                        setDate(date);
                      }}
                      renderInput={(props) => <TextField {...props} />}
                    />

                    <MobileTimePicker
                      label="Velg ankomst tid"
                      minTime={new Date(0, 0, 0, 12)}
                      maxTime={new Date(0, 0, 0, 21, 0)}
                      disablePast
                      ampm={false}
                      minutesStep={15}
                      value={arrivingTime}
                      onChange={(time) => {
                        setArrivingTime(time);
                      }}
                      renderInput={(props) => <TextField {...props} />}
                    />

                    <MobileTimePicker
                      label="Velg avreise tid"
                      minTime={new Date(0, 0, 0, 12)}
                      maxTime={new Date(0, 0, 0, 21, 0)}
                      disablePast
                      ampm={false}
                      minutesStep={15}
                      value={leavingTime}
                      onChange={(time) => {
                        setLeavingTime(time);
                      }}
                      renderInput={(props) => <TextField {...props} />}
                    />
                  </Stack>
                }
              </LocalizationProvider>

              {/* ----------- EMAIL NAME SECTION --------- */}

              <section className="email-name-section">
                <article>
                  <h5>Reservation details</h5>
                  <form className="person__form">
                    <div className="person__form__fields">
                      <label className="person__name-label">
                        <input
                          type="text"
                          name="name"
                          value={isName}
                          onChange={(e) => setIsName(e.target.value)}
                          className="person__name-input"
                        />
                        <span className="input-label__name">Name</span>
                      </label>
                      <label className="person__email-label">
                        <input
                          type="email"
                          name="email"
                          value={isEmail}
                          onChange={(e) => setIsEmail(e.target.value)}
                          className="person__email-input"
                        />
                        <span className="input-label__email">Email</span>
                      </label>
                    </div>
                    <input
                      type="submit"
                      value="Submit"
                      onClick={(e) => submitNameEmailAndBookTheTable(e)}
                    />
                  </form>
                </article>
              </section>
            </div>
          </form>
        </div>
        <MsgModal />
        {/* <div className="restaurant-map">
          <div className="restaurant-map__inner max-w-container-width w-full">
            <div className="sitting-area__row w-min h-22 flex">
              <div
                className="round-tables w-20 h-20 border-2 rounded-full border-white m-4"
                alt="table1"
                onClick={(e) => changeTableState(e)}
              ></div>
              <div
                className="round-tables w-20 h-20 border-2 rounded-full border-white m-4"
                alt="table2"
                onClick={(e) => changeTableState(e)}
              ></div>
              <div
                className="rectangle-tables w-20 h-20 border-2 rounded border-white m-4"
                alt="table3"
                onClick={(e) => changeTableState(e)}
              ></div>
            </div>
          </div>
        </div> */}
      </main>

      <footer className={styles.footer}>
        <span className={styles.logo}>All right reserved</span>
      </footer>
    </div>
  );
};

export default Home;
