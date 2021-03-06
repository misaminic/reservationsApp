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
import { format, areIntervalsOverlapping, addHours, addDays } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { useAppContext } from '../context/AppContext';
import FormFinish from '../components/FormFinish';
import freshCopyTableList from '../freshCopyTableList';
import { animated } from 'react-spring';
import { usePageAnimation } from '../styles/animations/pagesTransitions';
import Button from '@mui/material/Button';
import { useIsMount } from '../utils/utils';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

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
  }: any = useAppContext();

  const isMount = useIsMount();

  const { customAnimation }: any = usePageAnimation();

  const [numberOfPeople, setNumberOfPeople] = useState(2);

  const [tableBookedByTableNumber, setTableBookedByTableNumber] = useState('');
  const [currentTableReserved, setCurrentTableReserved] = useState({});
  const [reservedTables, setReservedTables] = useState([]);
  const [suitableTableSize, setSuitableTableSize] = useState([]);

  const [makeTableAvailableNumber, setMakeTableAvailableNumber] = useState();
  const [makeTableAvailableHour, setMakeTableAvailableHour] = useState();

  const [arrivingTime, setArrivingTime] = useState(new Date());
  const [leavingTime, setLeavingTime] = useState(new Date());

  const [arrivingTimeAsString, setArrivingTimeAsString] = useState('');

  const [timeStartEndUserInput, setTimeStartEndUserInput] = useState({});

  const [isName, setIsName] = useState('');
  const [isEmail, setIsEmail] = useState('');

  const [currentDate, setCurrentDate] = useState(new Date());
  const [twoWeeksInFuture, setTwoWeeksInFuture] = useState(
    addDays(new Date(), 13)
  );

  const [reservationCycleStatus, setReservationCycleStatus] = useState(false);

  useEffect(() => {
    //   set default values/dates for arrivalTime and leavingTime only on first render
    const day = currentDate.getDate();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    setArrivingTime(new Date(year, month, day, 12, 0));
    setLeavingTime(new Date(year, month, day, 13, 0));
  }, []);

  useEffect(() => {
    if (currentDate) {
      const dateFormatDbReady = currentDate.toString().slice(0, 15);
      setDate(dateFormatDbReady);
    }
  }, [currentDate]);

  useEffect(() => {
    if (arrivingTime && leavingTime) {
      setTimeStartEndUserInput({
        start: arrivingTime,
        end: leavingTime,
      });
      setArrivingTimeAsString(format(arrivingTime, 'H:mm'));
    }
  }, [arrivingTime, leavingTime]);

  useEffect(() => {
    if (numberOfPeople === 1) {
      const getAllTablesForTheSizeOfGroup = listOfAllTables.filter(
        (item: any) => {
          return item.key === 2;
        }
      );
      setSuitableTableSize(getAllTablesForTheSizeOfGroup);
    } else if (numberOfPeople === 3) {
      const getAllTablesForTheSizeOfGroup = listOfAllTables.filter(
        (item: any) => {
          return item.key === 4;
        }
      );
      setSuitableTableSize(getAllTablesForTheSizeOfGroup);
    } else {
      const getAllTablesForTheSizeOfGroup = listOfAllTables.filter(
        (item: any) => {
          return item.key === numberOfPeople;
        }
      );
      setSuitableTableSize(getAllTablesForTheSizeOfGroup);
    }
  }, [numberOfPeople, listOfAllTables, dataFromDb]);

  useEffect(() => {
    if (currentTableReserved) {
      const currentReservedTableInAllTables = listOfAllTables.filter(
        (item: any) => {
          return item.tables.filter((table: any) => {
            //@ts-ignore
            if (table.id === currentTableReserved?.id) {
              const currentTimeToAddIndex =
                //@ts-ignore
                currentTableReserved.reservedTimes.length - 1;
              //@ts-ignore
              table?.customers = [
                ...table.customers,
                {
                  tableNumber: table.id,
                  name: isName.toLowerCase(),
                  email: isEmail,
                  //@ts-ignore
                  time: currentTableReserved?.reservedTimes[
                    currentTimeToAddIndex
                  ],
                },
              ];
              //@ts-ignore
              table?.reservedTimes = [
                ...table.reservedTimes,
                //@ts-ignore
                currentTableReserved?.reservedTimes[currentTimeToAddIndex],
              ];
              return table;
            }
          });
        }
      );
    }
    //@ts-ignore
    updateListOfAllTables(currentReservedTableInAllTables);
    //@ts-ignore
    if (currentTableReserved?.id) {
      const reservedTablesWithoutFalsyValues = reservedTables.filter(
        (table) => table !== Boolean
      );

      const reservedTablesDbReady = reservedTablesWithoutFalsyValues.filter(
        (table) => {
          //@ts-ignore
          return table?.id !== currentTableReserved?.id;
        }
      );
      //@ts-ignore
      setReservedTables([...reservedTablesDbReady, currentTableReserved]);
    }

    setCurrentTableReserved({});
    setIsName('');
    setIsEmail('');
  }, [reservationCycleStatus]);

  useEffect(() => {
    if (isMount) {
      return;
    } else {
      sendData();
      axiosFetch();
    }
  }, [reservedTables]);

  useEffect(() => {
    axiosFetch();
  }, [currentDate]);

  const changeNumberOfPeople = (e: any) => {
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
    // axiosFetch();
    if (!arrivingTime || !leavingTime) {
      showTableAvailabilityMsg(
        true,
        `Sjekk ${arrivingTime ? 'avreise' : 'ankomst'} tid`
      );
      return;
    }

    if (arrivingTime.getHours() >= 0 && arrivingTime.getHours() < 12) {
      showTableAvailabilityMsg(true, `Et bord kan ikke bookes f??r klokka 12h`);
      return;
    }

    if (arrivingTime.getHours() >= 21 && arrivingTime.getMinutes() >= 15) {
      showTableAvailabilityMsg(true, `Et bord kan bookes senest klokka 21.15h`);
      return;
    }
    if (leavingTime.getHours() >= 22 && leavingTime.getMinutes() >= 1) {
      showTableAvailabilityMsg(true, `Senest avreisetid er klokka 22h`);
      return;
    } else {
      // getting all the tables and then each table's reservedTimes property
      // applying time library's function to check if intervals are overlapping
      // this returns array with boolean values, true if they are overlapping
      //@ts-ignore
      const allAvailableTablesForGroupSize = suitableTableSize[0].tables.filter(
        (table: any) => {
          return table.available === true && table;
        }
      );

      const availableTablesOnlyTheOneThatDontHaveCurrentTimeFrame =
        allAvailableTablesForGroupSize.map((table: any) => {
          if (table.reservedTimes.length === 0) {
            return table;
          } else {
            const timeAlreadyUsed = table.reservedTimes.some((time: any) => {
              const isTimeSlotNotReserved = _.isEqual(
                { start: new Date(time?.start), end: new Date(time?.end) },
                timeStartEndUserInput
              );

              return isTimeSlotNotReserved;
            });

            if (timeAlreadyUsed === false) {
              return table;
            } else {
              return;
            }
          }
        });

      const availableTablesFilteredFromFalsyValues =
        availableTablesOnlyTheOneThatDontHaveCurrentTimeFrame.filter(
          (item: any) => item !== null || undefined
        );

      if (availableTablesFilteredFromFalsyValues.length === 0) {
        showTableAvailabilityMsg(
          true,
          `Ingen ledig bord til ${numberOfPeople} personer klokka ${arrivingTimeAsString}h. Pr??v gjerne et annet tidspunkt`
        );
        return;
      }

      const availableTablesOnlyTheOneThatDontHaveCurrentTimeFrameAndTimeFramesNotOverlapping =
        availableTablesFilteredFromFalsyValues.map((table: any) => {
          if (table?.reservedTimes?.length === 0) {
            return table;
          } else {
            return table?.reservedTimes?.map((time: any) => {
              const checkIfTimesOverlapping = areIntervalsOverlapping(
                { start: new Date(time?.start), end: new Date(time?.end) },
                //@ts-ignore
                timeStartEndUserInput,
                {
                  inclusive: true,
                }
              );

              if (checkIfTimesOverlapping === false) {
                return table;
              } else {
                return;
              }
            });
          }
        });

      if (
        availableTablesOnlyTheOneThatDontHaveCurrentTimeFrameAndTimeFramesNotOverlapping.length ===
        0
      ) {
        showTableAvailabilityMsg(
          true,
          `Ingen ledig bord til ${numberOfPeople} personer klokka ${arrivingTimeAsString}h. Pr??v gjerne et annet tidspunkt`
        );
        return;
      }

      const availableTablesFiltered =
        availableTablesOnlyTheOneThatDontHaveCurrentTimeFrameAndTimeFramesNotOverlapping.filter(
          (item: any) => {
            if (item !== undefined) {
              return item[0] !== null;
            } else {
              return;
            }
          }
        );

      if (availableTablesFiltered.length === 0) {
        showTableAvailabilityMsg(
          true,
          `Ingen ledig bord til ${numberOfPeople} personer klokka ${arrivingTimeAsString}h. Pr??v gjerne et annet tidspunkt`
        );
        return;
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
      } else {
        changeAnimationStatus();
        setCurrentTableReserved(availableTablesFiltered[0]);
        changeCurrentFormPartVisible(1);
      }
    }
  };

  const submitNameEmailAndBookTheTable = (e: any) => {
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
      return fieldToValidate === false;
    });

    if (dataIsNotValid === false) {
      //@ts-ignore

      if (currentTableReserved[0]?.reservedTimes?.length > 0) {
        //@ts-ignore

        setCurrentTableReserved({
          //@ts-ignore

          ...currentTableReserved[0],

          reservedTimes: [
            //@ts-ignore
            ...currentTableReserved[0].reservedTimes,
            timeStartEndUserInput,
          ],
          //@ts-ignore
          customers: [
            //@ts-ignore
            ...currentTableReserved[0].customers,
            //@ts-ignore
            {
              //@ts-ignore
              tableNumber: currentTableReserved[0].id,
              name: isName.toLowerCase(),
              email: isEmail,
              time: timeStartEndUserInput,
            },
          ],
        });
        setReservationCycleStatus(!reservationCycleStatus);
        changeCurrentFormPartVisible(2);
      } else {
        setCurrentTableReserved({
          ...currentTableReserved,
          reservedTimes: [
            {
              //@ts-ignore
              start: new Date(timeStartEndUserInput.start),
              //@ts-ignore
              end: new Date(timeStartEndUserInput.end),
            },
          ],
          customers: [
            {
              //@ts-ignore
              tableNumber: currentTableReserved.id,
              name: isName.toLowerCase(),
              email: isEmail,
              time: timeStartEndUserInput,
            },
          ],
        });
        setReservationCycleStatus(!reservationCycleStatus);
        changeCurrentFormPartVisible(2);
      }
    }
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
              {currentFormPartVisible === 0 && (
                <animated.div style={style}>
                  <div className="booking-form date-and-time text-center md:mt-8 lg:mt-14">
                    <form>
                      <div className="form-control text-center">
                        <label htmlFor="antall-personer">Antall personer</label>
                        <div className="number-of-people">
                          <Button
                            variant="outlined"
                            sx={{ minWidth: 20, mt: 2, mb: 3 }}
                          >
                            <span
                              className="text-2xl"
                              onClick={(e) => changeNumberOfPeople(e)}
                            >
                              -
                            </span>
                          </Button>

                          <input
                            type="number"
                            className="w-12 bg-white border-2 rounded text-center ml-4 mr-4 p-3"
                            value={numberOfPeople}
                          />

                          <Button
                            variant="outlined"
                            sx={{ minWidth: 20, mt: 2, mb: 3 }}
                          >
                            <span
                              className="text-2xl"
                              onClick={(e) => changeNumberOfPeople(e)}
                            >
                              +
                            </span>
                          </Button>
                        </div>

                        <LocalizationProvider dateAdapter={DateAdapter}>
                          {
                            <Stack spacing={3}>
                              <DatePicker
                                label="Velg dato"
                                minDate={new Date()}
                                maxDate={twoWeeksInFuture}
                                inputFormat="dd/MM/yyyy"
                                disablePast
                                value={currentDate}
                                onChange={(date: any) => {
                                  setCurrentDate(date);
                                }}
                                renderInput={(props) => (
                                  <TextField {...props} />
                                )}
                              />

                              <MobileTimePicker
                                label="Velg ankomsttid"
                                minTime={new Date(0, 0, 0, 12)}
                                maxTime={new Date(0, 0, 0, 21, 0)}
                                // @ts-ignore
                                disablePast
                                ampm={false}
                                minutesStep={15}
                                value={arrivingTime}
                                onChange={(time: any) => {
                                  setArrivingTime(time);
                                }}
                                renderInput={(props) => (
                                  <TextField {...props} />
                                )}
                              />

                              <MobileTimePicker
                                label="Velg avreisetid"
                                minTime={new Date(0, 0, 0, 12)}
                                maxTime={new Date(0, 0, 0, 22, 0)}
                                //@ts-ignore
                                disablePast
                                ampm={false}
                                minutesStep={15}
                                value={leavingTime}
                                onChange={(time: any) => {
                                  setLeavingTime(time);
                                }}
                                renderInput={(props) => (
                                  <TextField {...props} />
                                )}
                              />

                              <Button
                                variant="contained"
                                sx={{ minWidth: 20, mt: 2, mb: 3 }}
                                onClick={() => checkTableAvailability()}
                              >
                                Next
                              </Button>
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

        {/* ----------- EMAIL NAME SECTION --------- */}

        {currentFormPartVisible === 1 && (
          <>
            {customAnimation((style: any, isAnimated: boolean) =>
              isAnimated ? (
                <animated.div style={style}>
                  <section className="email-name-section">
                    <article>
                      <h5 className="text-center mb-8">RESERVATION DETAILS</h5>
                      <form className="person__form">
                        <div className="person__form__fields flex flex-col">
                          <div className="mb-6 bg-gray-300">
                            <label className="person__name-label">
                              <input
                                type="text"
                                name="name"
                                placeholder="Navn"
                                value={isName}
                                onChange={(e) => setIsName(e.target.value)}
                                className="person__name-input w-full p-2"
                              />
                            </label>
                          </div>
                          <div className="mb-4 bg-gray-300">
                            <label className="person__email-label">
                              <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={isEmail}
                                onChange={(e) => setIsEmail(e.target.value)}
                                className="person__email-input w-full p-2"
                              />
                            </label>
                          </div>
                          <Button
                            variant="contained"
                            sx={{ minWidth: 20, mt: 2, mb: 2 }}
                            onClick={(e) => submitNameEmailAndBookTheTable(e)}
                            type="submit"
                          >
                            BESTILL
                          </Button>
                          <Button
                            variant="outlined"
                            sx={{ minWidth: 20, mt: 1 }}
                            onClick={(e) => changeCurrentFormPartVisible(0)}
                          >
                            TILBAKE
                          </Button>
                        </div>
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
