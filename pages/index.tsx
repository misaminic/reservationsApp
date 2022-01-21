import { useState, useEffect, useContext } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import MsgModal from '../components/MsgModal';
import _ from 'lodash';
import styles from '../styles/Home.module.css';
import DateAdapter from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import TextField from '@mui/material/TextField';
import MobileTimePicker from '@mui/lab/MobileTimePicker';
import DesktopTimePicker from '@mui/lab/DesktopTimePicker';
import DatePicker from '@mui/lab/DatePicker';
import Stack from '@mui/material/Stack';
import { format, areIntervalsOverlapping, addHours } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { useAppContext } from '../context/AppContext';
import FormFinish from '../components/FormFinish';
import freshCopyTableList from '../freshCopyTableList';
import { animated } from 'react-spring';
import { usePageAnimation } from '../styles/animations/pagesTransitions';

const Home: NextPage = () => {
  // using app context
  const {
    sendData,
    dataFromDb,
    setDate,
    showTableAvailabilityMsg,
    listOfAllTables,
    currentFormPartVisible,
    isAnimated,
    changeCurrentFormPartVisible,
    changeAnimationStatus,
    updateListOfAllTables,
    axiosFetch,
  } = useAppContext();

  const { customAnimation }: any = usePageAnimation();

  const novaFn = () => {
    props.handleMail();
    props.handleName();
  };

  // const [fade, setFade] = useState(isAnimated);

  const [allTables, setAllTables] = useState(listOfAllTables);

  const [numberOfPeople, setNumberOfPeople] = useState(2);

  const [tableBookedByTableNumber, setTableBookedByTableNumber] = useState('');
  const [currentTableReserved, setCurrentTableReserved] = useState({});
  const [reservedTables, setReservedTables] = useState([]);
  const [suitableTableSize, setSuitableTableSize] = useState([]);

  const [makeTableAvailableNumber, setMakeTableAvailableNumber] = useState();
  const [makeTableAvailableHour, setMakeTableAvailableHour] = useState();

  const [arrivingTime, setArrivingTime] = useState('');

  const [arrivingTimeAsString, setArrivingTimeAsString] = useState('');

  const [leavingTime, setLeavingTime] = useState('');

  const [timeStartEndUserInput, setTimeStartEndUserInput] = useState({});

  const [isName, setIsName] = useState('');
  const [isEmail, setIsEmail] = useState('');

  const [currentDate, setCurrentDate] = useState('');

  const [reservationCycleStatus, setReservationCycleStatus] = useState(false);

  // const [currentFormPartVisible, setCurrentFormPartVisible] = useState(0);

  const handleMail = (e) => {
    setIsEmail(e.target.value);
  };

  const handleName = (e) => {
    setIsName(e.target.value);
  };

  useEffect(() => {
    if (currentDate) {
      const dateFormatDbReady = currentDate.toString().slice(0, 15);
      setDate(dateFormatDbReady);
    }
    console.log(dataFromDb.data?.reservations, 'PROMENA DATUMA');
  }, [currentDate]);

  useEffect(() => {
    if (dataFromDb.data?.reservations?.tables.length > 0) {
      updateListOfAllTables(dataFromDb.data.reservations.tables);
      console.log('ide dataFromDb');
    } else {
      console.log('idu default stolovi');
      updateListOfAllTables(freshCopyTableList);
      console.log(freshCopyTableList, 'ovo ti je kao nova lista stolova');
    }
  }, [dataFromDb, currentTableReserved, currentDate]);

  useEffect(() => {
    console.log(allTables, 'Najnoviji svi stolovi');
  }, [allTables]);

  useEffect(() => {
    if (arrivingTime && leavingTime) {
      // const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // const arrival = zonedTimeToUtc(arrivingTime, timeZone);
      // const leaving = zonedTimeToUtc(leavingTime, timeZone);
      // console.log(arrivingTime.toISOString());
      setTimeStartEndUserInput({
        start: arrivingTime,
        end: leavingTime,
      });
      setArrivingTimeAsString(format(arrivingTime, 'H:mm'));
    }
  }, [arrivingTime, leavingTime]);

  // useEffect(() => {
  //   // console.log(currentTableReserved?.id, 'iz efekta trenutni sto');
  //   if (currentTableReserved?.id) {
  //     const reservedTablesWithoutFalsyValues = reservedTables.filter(
  //       (table) => table !== Boolean
  //     );

  //     const reservedTablesDbReady = reservedTablesWithoutFalsyValues.filter(
  //       (table) => {
  //         return table?.id !== currentTableReserved?.id;
  //       }
  //     );

  //     setReservedTables([...reservedTablesDbReady, currentTableReserved]);
  //   }
  // }, [currentTableReserved]);

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
  }, [numberOfPeople, allTables, listOfAllTables]);

  useEffect(() => {
    console.log(currentTableReserved, 'usao u zavrsni USEEFFEC');
    if (currentTableReserved) {
      const currentReservedTableInAllTables = allTables.filter((item) => {
        return item.tables.filter((table) => {
          // console.log(table, ' table u svi stolovi');
          // console.log(table.id, 'table ID');
          // console.log(currentTableReserved?.id, 'crt table ID');
          if (table.id === currentTableReserved?.id) {
            const currentTimeToAddIndex =
              currentTableReserved.reservedTimes.length - 1;

            console.log(
              currentTableReserved?.reservedTimes[currentTimeToAddIndex],
              'ovo je iz Zadnjeg useEFFECT'
            );

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

    // setAllTables(allTables)
    updateListOfAllTables(allTables);

    // console.log(currentReservedTableInAllTables, 'nadjen sto poslednji UseEff');
    // console.log(reservedTables, 'rezervisani poslednji useEff');
    // console.log(allTables, 'svi stolovi poslednji useEff');

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

    setCurrentTableReserved({});
    setIsName('');
    setIsEmail('');
  }, [reservationCycleStatus]);

  useEffect(() => {
    sendData();
    axiosFetch();
  }, [reservedTables]);

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
    if (!arrivingTime || !leavingTime) {
      showTableAvailabilityMsg(
        true,
        `Sjekk ${arrivingTime ? 'avreise' : 'ankomst'} tid`
      );
    } else {
      // getting all the tables and then each table's reservedTimes property
      // applying time library's function to check if intervals are overlapping
      // this returns array with boolean values, true if they are overlapping

      const allAvailableTablesForGroupSize = suitableTableSize[0].tables.filter(
        (table) => {
          return table.available === true && table;
        }
      );

      // console.log(allAvailableTablesForGroupSize, 'SAD svi dostupni');
      const availableTablesOnlyTheOneThatDontHaveCurrentTimeFrame =
        allAvailableTablesForGroupSize.map((table) => {
          if (table.reservedTimes.length === 0) {
            return table;
          } else {
            const timeAlreadyUsed = table.reservedTimes.some((time) => {
              const timeSlotNotReserved = _.isEqual(
                { start: new Date(time?.start), end: new Date(time?.end) },
                timeStartEndUserInput
              );

              return timeSlotNotReserved === true;
            });

            return timeAlreadyUsed === false ? table : 'kurcina';
          }
        });

      const availableTablesFilteredFromFalsyValues =
        availableTablesOnlyTheOneThatDontHaveCurrentTimeFrame.filter(
          (item) => item !== null || undefined
        );

      if (availableTablesFilteredFromFalsyValues.length === 0) {
        showTableAvailabilityMsg(
          true,
          `Ingen ledig bord til ${numberOfPeople} personer klokka ${arrivingTimeAsString}h. Prøv gjerne et annet tidspunkt`
        );
      }

      const availableTablesOnlyTheOneThatDontHaveCurrentTimeFrameAndTimeFramesNotOverlapping =
        availableTablesFilteredFromFalsyValues.map((table) => {
          if (table.reservedTimes?.length === 0) {
            return table;
          } else {
            return table?.reservedTimes?.map((time) => {
              // console.log(
              //   { start: new Date(time.start), end: new Date(time.end) },
              //   time,
              //   'vreme u bazi',
              //   timeStartEndUserInput,
              //   'user vreme'
              // );
              const checkIfTimesOverlapping = areIntervalsOverlapping(
                { start: new Date(time?.start), end: new Date(time?.end) },
                timeStartEndUserInput,
                {
                  inclusive: true,
                }
              );
              console.log(
                checkIfTimesOverlapping === false
                  ? table.id
                  : `${table.id} vremena se seku`
              );
              return checkIfTimesOverlapping === false ? table : null;
            });
          }
        });

      if (
        availableTablesOnlyTheOneThatDontHaveCurrentTimeFrameAndTimeFramesNotOverlapping.length ===
        0
      ) {
        showTableAvailabilityMsg(
          true,
          `Ingen ledig bord til ${numberOfPeople} personer klokka ${arrivingTimeAsString}h. Prøv gjerne et annet tidspunkt`
        );
      }

      const availableTablesFiltered =
        availableTablesOnlyTheOneThatDontHaveCurrentTimeFrameAndTimeFramesNotOverlapping.filter(
          (item) => {
            if (item !== undefined) {
              console.log(item[0], 'sta je ITEM');
              return item[0] !== null;
            } else {
              console.log('item ti undefined');
              return;
            }
          }
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
        changeAnimationStatus();
        setCurrentTableReserved(availableTablesFiltered[randomNumber]);
        changeCurrentFormPartVisible(1);
        console.log(
          availableTablesFiltered[randomNumber]
          // 'available table kad je vise itema'
        );
      } else {
        changeAnimationStatus();
        setCurrentTableReserved(availableTablesFiltered[0]);
        changeCurrentFormPartVisible(1);

        console.log(
          availableTablesFiltered[0]
          // 'available table kad je jedan item'
        );
      }
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
          // console.log(table, 'sto u vremenu da li se seku');
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
    console.log(e);
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
      return fieldToValidate === false;
    });

    if (dataIsNotValid === false) {
      if (currentTableReserved[0]?.reservedTimes?.length > 0) {
        console.log(currentTableReserved[0], 'ovo ti je crt TABLE SAD');
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
        setReservationCycleStatus(!reservationCycleStatus);
        changeCurrentFormPartVisible(2);
        // changeAnimationStatus();
      } else {
        console.log(currentTableReserved, 'usao u else');
        console.log(timeStartEndUserInput, 'usao u else');
        setCurrentTableReserved({
          ...currentTableReserved,
          reservedTimes: [
            {
              start: timeStartEndUserInput.start,
              end: timeStartEndUserInput.end,
            },
          ],
          customers: [
            {
              name: isName,
              email: isEmail,
              time: timeStartEndUserInput,
            },
          ],
        });
        setReservationCycleStatus(!reservationCycleStatus);
        changeCurrentFormPartVisible(2);
        // changeAnimationStatus();
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
        <title>Create Next App</title>
        <meta name="description" content="Table reservation" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {customAnimation((style: any, isAnimated: boolean) =>
          isAnimated ? (
            <>
              {/* <h1 className={styles.title}>Book a table</h1> */}

              {currentFormPartVisible === 0 && (
                <animated.div style={style}>
                  <div className="booking-form">
                    <form>
                      <div className="form-control text-center">
                        <label htmlFor="antall-personer">Antall personer</label>
                        <div className="number-of-people">
                          <span
                            className="text-2xl"
                            onClick={(e) => changeNumberOfPeople(e)}
                          >
                            -
                          </span>
                          <input
                            type="number"
                            id="antall-personer"
                            className="w-12 bg-white rounded text-center m-8"
                            value={numberOfPeople}
                          />
                          <span
                            className="text-2xl"
                            onClick={(e) => changeNumberOfPeople(e)}
                          >
                            +
                          </span>
                        </div>

                        <LocalizationProvider dateAdapter={DateAdapter}>
                          {
                            <Stack spacing={3}>
                              <DatePicker
                                label="Velg dato"
                                minDate={new Date()}
                                maxDate={new Date('2022-01-15T21:00')}
                                inputFormat="dd/MM/yyyy"
                                disablePast
                                value={currentDate}
                                onChange={(date) => {
                                  setCurrentDate(date);
                                }}
                                renderInput={(props) => (
                                  <TextField {...props} />
                                )}
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
                                renderInput={(props) => (
                                  <TextField {...props} />
                                )}
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
                                renderInput={(props) => (
                                  <TextField {...props} />
                                )}
                              />

                              <button
                                type="button"
                                onClick={() => checkTableAvailability()}
                              >
                                Next
                              </button>
                            </Stack>
                          }
                        </LocalizationProvider>
                      </div>
                    </form>
                  </div>
                </animated.div>
              )}
            </>
          ) : null
        )}

        {/* <div>
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
            </div> */}

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
                          <li key={index}>
                            {_.isEmpty(time)
                              ? null
                              : format(new Date(time.start), 'H:mm')}
                          </li>
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

        {/* ----------- EMAIL NAME SECTION --------- */}

        {currentFormPartVisible === 1 && (
          <>
            {customAnimation((style: any, isAnimated: boolean) =>
              isAnimated ? (
                <animated.div style={style}>
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
                </animated.div>
              ) : null
            )}
          </>
        )}

        {customAnimation((style: any, isAnimated: boolean) =>
          isAnimated ? (
            <>
              <animated.div style={style}>
                {currentFormPartVisible === 2 && <FormFinish />}
              </animated.div>
            </>
          ) : null
        )}

        <MsgModal />
      </main>
      <footer className={styles.footer}>
        <span className={styles.logo}>All right reserved</span>
      </footer>
    </div>
  );
};

export default Home;
