import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import TableOptionsModal from './TableOptionsModal';
import DateAdapter from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  addDays,
  subDays,
  addHours,
  subHours,
  areIntervalsOverlapping,
  set,
} from 'date-fns';
import _ from 'lodash';
import tables from '../amountOfTables';
import MobileTimePicker from '@mui/lab/MobileTimePicker';
import SearchReservationsModal from './SearchReservationsModal';

const TableMap = () => {
  const {
    listOfAllTables,
    showTableOptionsModal,
    showSearchReservationsModal,
    tablesStates,
    setDate,
    dataFromDb,
    axiosFetch,
    tableOptions,
  }: any = useAppContext();

  const [currentTable, setCurrentTable] = useState<any>({});
  const [currentTableSize, setCurrentTableSize] = useState<any>(0);
  const [currentDate, setCurrentDate] = useState<any>(new Date());
  const [currentTablesStates, setCurrentTableStates] = useState<any>({});
  const [currentArrivingTime, setCurrentArrivingTime] = useState<any>(
    new Date()
  );
  const [currentLeavingTime, setCurrentLeavingTime] = useState<any>(
    addHours(new Date(currentArrivingTime), 1)
  );
  const [currentMinLeavingTime, setCurrentMinLeavingTime] = useState(0);
  const [twoWeeksInFuture, setTwoWeeksInFuture] = useState(
    addDays(new Date(), 13)
  );

  const [
    currentTablesToChangeAvailability,
    setCurrentTablesToChangeAvailability,
  ] = useState([]);

  const [currentBlockedTables, setCurrentBlockedTables] = useState([]);

  useEffect(() => {
    // set minutes for currentArrivalTime and currentLeavingTime to be 0, 15, 30 or 45
    const day = currentDate.getDate();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    setCurrentArrivingTime(new Date(year, month, day, 12, 0));
    setCurrentLeavingTime(new Date(year, month, day, 13, 0));
  }, []);

  useEffect(() => {
    setCurrentTablesToChangeAvailability(tablesStates);
  }, [currentDate]);

  useEffect(() => {
    if (currentDate) {
      const dateFormatDbReady = currentDate.toString().slice(0, 15);
      setDate(dateFormatDbReady);

      // set minimum time for leaving a table
      const minLeavingHour = currentArrivingTime.getHours();
      setCurrentMinLeavingTime(minLeavingHour);
    }
  }, [currentDate, currentArrivingTime, currentLeavingTime]);

  useEffect(() => {
    axiosFetch();
  }, [currentTablesToChangeAvailability]);

  useEffect(() => {
    if (currentArrivingTime.getHours() <= currentLeavingTime.getHours()) {
      let allTablesThatHaveSomeTimeReserved = listOfAllTables.map(
        (tableGroups: any) => {
          return tableGroups.tables.map((table: any) => {
            return table.reservedTimes.length > 0 ? table : null;
          });
        }
      );

      const withoutFalseValues = allTablesThatHaveSomeTimeReserved.map(
        (arrayOfTables: any) => {
          return _.compact(arrayOfTables);
        }
      );

      let tablesWithTimesOverlapping;

      if (withoutFalseValues) {
        tablesWithTimesOverlapping = withoutFalseValues.map(
          (tableGroups: any) => {
            return tableGroups.map((table: any) => {
              if (table.reservedTimes?.length > 0) {
                const timeAlreadyUsed = table.reservedTimes.some(
                  (time: any) => {
                    const timeSlotReserved = _.isEqual(
                      {
                        start: new Date(time?.start),
                        end: new Date(time?.end),
                      },
                      {
                        start: new Date(currentArrivingTime),
                        end: new Date(currentLeavingTime),
                      }
                    );
                    return timeSlotReserved === true;
                  }
                );

                if (timeAlreadyUsed === true) {
                  return table.id;
                } else {
                  const areTimesOverlapping = table.reservedTimes.some(
                    (time: any) => {
                      const day = currentDate.getDate();
                      const month = currentDate.getMonth();
                      const year = currentDate.getFullYear();
                      const hourArrive = currentArrivingTime.getHours();
                      const minutesArrive = currentArrivingTime.getMinutes();
                      const hourLeave = currentLeavingTime.getHours();
                      const minutesLeave = currentLeavingTime.getMinutes();

                      const arrive = new Date(
                        year,
                        month,
                        day,
                        hourArrive,
                        minutesArrive,
                        0
                      );

                      const leave = new Date(
                        year,
                        month,
                        day,
                        hourLeave,
                        minutesLeave,
                        0
                      );

                      const checkIfTimesOverlapping = areIntervalsOverlapping(
                        {
                          start: new Date(time?.start),
                          end: new Date(time?.end),
                        },
                        {
                          start: new Date(arrive),
                          end: new Date(leave),
                        },
                        {
                          inclusive: true,
                        }
                      );
                      return checkIfTimesOverlapping === true;
                    }
                  );
                  return areTimesOverlapping === true ? table.id : null;
                }
              }
            });
          }
        );
      }

      const tablesWithTimesOverlappingWithoutFalsyValues =
        tablesWithTimesOverlapping.map((tableGroups: any) => {
          return tableGroups.filter((item: any) => item !== null);
        });

      let reservedTablesIds: any = [];

      if (tablesWithTimesOverlappingWithoutFalsyValues) {
        tablesWithTimesOverlappingWithoutFalsyValues.map(
          (arrayOfTables: any) => {
            return arrayOfTables.map((item: any) => {
              return reservedTablesIds.push(item);
            });
          }
        );
      }

      let currentTablesToChangeAvailability = _.cloneDeep(tablesStates);

      if (reservedTablesIds.length > 0) {
        const reservedTablesToChangeState = reservedTablesIds.map((id: any) => {
          return _.filter(currentTablesToChangeAvailability, { id: id });
        });

        reservedTablesToChangeState.forEach((tableGroup: any) => {
          return tableGroup.forEach((table: any) => {
            return (table.occupied = true);
          });
        });

        setCurrentTableStates(currentTablesToChangeAvailability);
      }

      if (reservedTablesIds.length === 0) {
        currentTablesToChangeAvailability.forEach((table: any) => {
          return (table.occupied = false);
        });

        setCurrentTableStates(currentTablesToChangeAvailability);
      }

      // get blocked tables

      let blockedTablesIds: any = [];

      listOfAllTables.map((tableGroups: any) => {
        return tableGroups.tables.forEach((table: any) => {
          return table.available === false
            ? blockedTablesIds.push(table)
            : null;
        });
      });

      let currentTablesToChangeBlockingStatus = _.cloneDeep(tablesStates);

      if (blockedTablesIds.length > 0) {
        const tablesToChangeBlockingStatus = blockedTablesIds.map(
          (table: any) => {
            return _.filter(currentTablesToChangeBlockingStatus, {
              id: table.id,
            });
          }
        );

        tablesToChangeBlockingStatus.forEach((tableGroup: any) => {
          return tableGroup.forEach((table: any) => {
            return (table.available = false);
          });
        });

        setCurrentBlockedTables(currentTablesToChangeBlockingStatus);
      }

      if (blockedTablesIds.length === 0) {
        currentTablesToChangeBlockingStatus.forEach((table: any) => {
          return (table.available = true);
        });

        setCurrentBlockedTables(currentTablesToChangeBlockingStatus);
      }
    }
  }, [
    listOfAllTables,
    currentDate,
    currentArrivingTime,
    currentLeavingTime,
    tablesStates,
    showTableOptionsModal,
  ]);

  const searchReservations = () => {
    showSearchReservationsModal();
  };

  // add or subtract one day from a current date by clicking on chevrons
  const changeDayHandlerPlus = () => {
    setCurrentDate((prevState: any) => addDays(new Date(prevState), 1));
  };

  const changeDayHandlerMinus = () => {
    setCurrentDate((prevState: any) => subDays(new Date(prevState), 1));
  };

  const changeHourHandlerPlusArrivingTime = () => {
    if (currentArrivingTime.getHours() >= 21) {
      setCurrentArrivingTime(currentArrivingTime);
    } else {
      setCurrentArrivingTime((prevState: any) =>
        addHours(new Date(prevState), 1)
      );
    }
  };

  const changeHourHandlerMinusArrivingTime = () => {
    if (currentArrivingTime.getHours() <= 12) {
      setCurrentArrivingTime(currentArrivingTime);
    } else {
      setCurrentArrivingTime((prevState: any) =>
        subHours(new Date(prevState), 1)
      );
    }
  };

  const changeHourHandlerPlusLeavingTime = () => {
    const day = currentLeavingTime.getDate();
    const month = currentLeavingTime.getMonth();
    const year = currentLeavingTime.getFullYear();

    if (currentLeavingTime.getHours() >= 21) {
      setCurrentLeavingTime(new Date(year, month, day, 22, 0));
    } else {
      setCurrentLeavingTime((prevState: any) =>
        addHours(new Date(prevState), 1)
      );
    }
  };

  const changeHourHandlerMinusLeavingTime = () => {
    if (currentLeavingTime.getHours <= 13) {
      setCurrentLeavingTime(currentLeavingTime);
    } else {
      setCurrentLeavingTime((prevState: any) =>
        subHours(new Date(prevState), 1)
      );
    }
  };

  // Adding restaurant overview options - which tables are available at a given time

  // Manipulate table, book and cancel reservation
  const changeTableState = (e: any) => {
    let tableNumberClicked: any;
    let tableSize: any;
    // check which element is clicked in order to get proper data
    //  needed to find suitable table size and the clicked table
    // table size is defined by adding custom html attribute
    if (e.target.nodeName === 'DIV') {
      tableNumberClicked = +e.target.firstChild.innerText;
      tableSize = +e.target.dataset.size;
    }

    if (e.target.nodeName === 'H3') {
      tableNumberClicked = +e.target.innerText;
      tableSize = +e.target.parentElement.dataset.size;
    }

    if (tableSize) {
      // first find the group in which the clicked table is
      const allTablesForTheGroupSize = listOfAllTables.find((tables: any) => {
        return tables.key === tableSize;
      });

      // then find the table that is clicked
      const clickedTable = allTablesForTheGroupSize.tables.find(
        (table: any) => {
          return table.id === tableNumberClicked;
        }
      );

      if (clickedTable) {
        setCurrentTable(clickedTable);
        setCurrentTableSize(tableSize);
        showTableOptionsModal();
      }
    }
  };

  return (
    <>
      <TableOptionsModal table={currentTable} size={currentTableSize} />
      <SearchReservationsModal />
      <section className="date-time-tablemap-wrapper relative flex flex-col items-center">
        <section className="date-and-time text-center md:mt-8 lg:mt-14">
          <h1 className="text-2xl mt-2 mb-4">BORDOVERSIKT</h1>
          <div className="date flex justify-self-center mt-4 mb-4">
            <Button
              variant="outlined"
              size="small"
              className="mr-1 lg:mr-8"
              //@ts-ignore
              onClick={(e: any) => changeDayHandlerMinus(e)}
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
            >
              <ChevronLeftIcon />
            </Button>

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
                    onChange={(date) => {
                      setCurrentDate(date);
                    }}
                    renderInput={(props) => (
                      <TextField
                        {...props}
                        sx={{
                          maxWidth: 223,
                          minWidth: 192,
                          background: 'white',
                          opacity: 0.95,
                          borderRadius: '0.25rem',
                        }}
                      />
                    )}
                  />
                </Stack>
              }
            </LocalizationProvider>
            <Button
              variant="outlined"
              size="small"
              className="ml-1 lg:ml-8"
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
            >
              {/* //@ts-ignore */}
              <ChevronRightIcon onClick={(e: any) => changeDayHandlerPlus(e)} />
            </Button>
          </div>

          <div className="arrivingTime flex justify-self-center mb-4">
            <Button
              variant="outlined"
              size="small"
              className="mr-1 lg:mr-8"
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
            >
              <ChevronLeftIcon
                // @ts-ignore
                onClick={(e: any) => changeHourHandlerMinusArrivingTime(e)}
              />
            </Button>

            <LocalizationProvider dateAdapter={DateAdapter}>
              {
                <Stack spacing={3}>
                  <MobileTimePicker
                    label="Velg ankomsttid"
                    minTime={new Date(0, 0, 0, 12)}
                    maxTime={new Date(0, 0, 0, 21, 0)}
                    //@ts-ignore
                    disablePast
                    ampm={false}
                    minutesStep={15}
                    value={currentArrivingTime}
                    onChange={(time) => {
                      setCurrentArrivingTime(time);
                    }}
                    renderInput={(props) => (
                      <TextField
                        {...props}
                        sx={{
                          maxWidth: 223,
                          minWidth: 192,
                          background: 'white',
                          opacity: 0.95,
                          borderRadius: '0.25rem',
                        }}
                      />
                    )}
                  />
                </Stack>
              }
            </LocalizationProvider>
            <Button
              variant="outlined"
              size="small"
              className="ml-1 lg:ml-8"
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
            >
              <ChevronRightIcon
                //@ts-ignore
                onClick={(e: any) => changeHourHandlerPlusArrivingTime(e)}
              />
            </Button>
          </div>

          <div className="leavingTime flex justify-self-center mb-4">
            <Button
              variant="outlined"
              size="small"
              className="mr-1 lg:mr-8"
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
            >
              <ChevronLeftIcon
                //@ts-ignore
                onClick={(e: any) => changeHourHandlerMinusLeavingTime(e)}
              />
            </Button>

            <LocalizationProvider dateAdapter={DateAdapter}>
              {
                <Stack spacing={3}>
                  <MobileTimePicker
                    label="Velg avreisetid"
                    minTime={new Date(0, 0, 0, currentMinLeavingTime, 30)}
                    maxTime={new Date(0, 0, 0, 22, 0)}
                    //@ts-ignore
                    disablePast
                    ampm={false}
                    minutesStep={15}
                    value={currentLeavingTime}
                    onChange={(time) => {
                      setCurrentLeavingTime(time);
                    }}
                    renderInput={(props) => (
                      <TextField
                        {...props}
                        sx={{
                          maxWidth: 223,
                          minWidth: 192,
                          background: 'white',
                          opacity: 0.95,
                          borderRadius: '0.25rem',
                        }}
                      />
                    )}
                  />
                </Stack>
              }
            </LocalizationProvider>
            <Button
              variant="outlined"
              size="small"
              className="ml-1 lg:ml-8"
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
            >
              <ChevronRightIcon
                //@ts-ignore
                onClick={(e) => changeHourHandlerPlusLeavingTime(e)}
              />
            </Button>
          </div>
          <div className="search flex place-content-center mb-4">
            <Button
              variant="contained"
              size="medium"
              //@ts-ignore
              onClick={(e) => searchReservations(e)}
            >
              SØK RESERVASJON
            </Button>
          </div>
        </section>

        <section className="restaurant-map w-max lg:h-0 justify-center justify-items-center justify-self-center mt-8 mb-8 mx-auto md:mt-24 lg:-mt-32">
          <div className="restaurant-map__inner lg:rotate-90">
            <div className="sitting-area max-w-screen max-h-full grid sm:grid-cols-3 m-0 lg:m-4">
              {/* -----------  GAMLE SOFIAS ----------- */}

              <div className="eight bg-siva border-sivaBorder border-t-4 border-l-4 flex justify-start rounded-tl-lg">
                <div
                  className={` ${
                    currentTablesStates[7]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore
                    currentBlockedTables[7]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  }
                rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:mt-4 md:ml-8 m-2`}
                  //@ts-ignore
                  alt="table8"
                  data-size="4"
                  onClick={(e: any) => changeTableState(e)}
                >
                  <h3>8</h3>
                </div>
              </div>
              <div className="fifteen bg-siva border-sivaBorder border-t-4 border-r-4 flex justify-end">
                <div
                  className={` ${
                    currentTablesStates[13]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore
                    currentBlockedTables[13]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:mt-4 md:mr-8 m-2`}
                  //@ts-ignore
                  alt="table15"
                  data-size="4"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>15</h3>
                </div>
              </div>
              <div className="invisible-element-3 bg-siva border-sivaBorder flex justify-start border-t-4 border-r-4 pb-1 rounded-tr-lg">
                <div
                  className="rectangle-tables w-16 h-10 flex justify-center items-center md:ml-8 m-2"
                  //@ts-ignore
                  alt="invisible"
                  onClick={(e) => changeTableState(e)}
                ></div>
              </div>
              <div className="seven bg-siva border-sivaBorder border-l-4 flex justify-start border-b-4 pb-1">
                <div
                  className={` ${
                    currentTablesStates[6]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore
                    currentBlockedTables[6]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg  md:ml-8 m-2`}
                  //@ts-ignore
                  alt="table7"
                  //@ts-ignore
                  data-size="4"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>7</h3>
                </div>
              </div>
              <div className="fourteen bg-siva border-sivaBorder border-r-4 flex justify-end border-b-4">
                <div
                  className={` ${
                    currentTablesStates[12]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore
                    currentBlockedTables[12]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:mr-8 m-2`}
                  //@ts-ignore
                  alt="table14"
                  data-size="4"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>14</h3>
                </div>
              </div>
              <div className="invisible-element-4 bg-siva border-sivaBorder flex justify-start border-r-4 pb-1">
                <div
                  className="rectangle-tables w-16 h-10 flex justify-center items-center md:ml-8 m-2"
                  //@ts-ignore
                  alt="invisible"
                  onClick={(e) => changeTableState(e)}
                ></div>
              </div>

              {/* --------- MIDTEN GAMLE SOFIAS ------------ */}

              <div className="six bg-siva border-sivaBorder border-l-4 items-center flex justify-start pt-1">
                <div
                  className={` ${
                    currentTablesStates[5]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore
                    currentBlockedTables[5]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg  md:ml-8 m-2`}
                  //@ts-ignore
                  alt="table6"
                  data-size="2"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>6</h3>
                </div>
              </div>
              <div className="thirteen bg-siva border-sivaBorder border-r-4 flex justify-end pt-1">
                <div
                  className={` ${
                    currentTablesStates[11]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore
                    currentBlockedTables[11]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:mr-8 m-2`}
                  //@ts-ignore
                  alt="table13"
                  data-size="4"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>13</h3>
                </div>
              </div>
              <div className="invisible-element-5 bg-siva border-sivaBorder flex justify-start border-r-4 pb-1">
                <div
                  className="rectangle-tables w-16 h-10 flex justify-center items-center md:ml-8 m-2"
                  //@ts-ignore
                  alt="invisible"
                  onClick={(e) => changeTableState(e)}
                ></div>
              </div>
              <div className="five bg-siva border-sivaBorder border-l-4 flex justify-start">
                <div
                  className={` ${
                    currentTablesStates[4]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore
                    currentBlockedTables[4]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:ml-8 m-2`}
                  //@ts-ignore
                  alt="table5"
                  data-size="4"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>5</h3>
                </div>
              </div>
              <div className="twelve bg-siva border-sivaBorder border-r-4 flex justify-end">
                <div
                  className={` ${
                    currentTablesStates[10]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore
                    currentBlockedTables[10]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:mr-8 m-2`}
                  //@ts-ignore
                  alt="table12"
                  data-size="12"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>12</h3>
                </div>
              </div>
              <div className="invisible-element-6 bg-siva border-sivaBorder flex justify-start border-r-4 pb-1">
                <div
                  className="rectangle-tables w-16 h-10 flex justify-center items-center md:ml-8 m-2"
                  //@ts-ignore
                  alt="invisible"
                  onClick={(e) => changeTableState(e)}
                ></div>
              </div>
              <div
                className={`four bg-siva border-sivaBorder border-l-4 flex justify-start pb-1`}
              >
                <div
                  className={` ${
                    currentTablesStates[3]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore
                    currentBlockedTables[3]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:ml-8 m-2`}
                  //@ts-ignore
                  alt="table4"
                  data-size="4"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>4</h3>
                </div>
              </div>
              <div className="invisible-element bg-siva border-sivaBorder flex justify-start border-r-4 pb-1">
                <div
                  className="rectangle-tables w-16 h-10 flex justify-center items-center md:ml-8 m-2"
                  //@ts-ignore
                  alt="invisible"
                  onClick={(e) => changeTableState(e)}
                ></div>
              </div>
              <div className="invisible-element-7 bg-siva border-sivaBorder flex justify-start border-r-4 pb-1">
                <div
                  className="rectangle-tables w-16 h-10 flex justify-center items-center md:ml-8 m-2"
                  //@ts-ignore
                  alt="invisible"
                  onClick={(e) => changeTableState(e)}
                ></div>
              </div>

              {/* ---------- INGANG GAMLE SOFIAS ------------ */}

              <div className="three bg-siva border-sivaBorder border-l-4 flex justify-start pt-1 border-t-4">
                <div
                  className={` ${
                    currentTablesStates[2]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore
                    currentBlockedTables[2]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } rectangle-tables w-10 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:ml-8 m-2`}
                  //@ts-ignore
                  alt="table3"
                  data-size="2"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>3</h3>
                </div>
              </div>
              <div className="eleven bg-siva border-sivaBorder border-r-4 flex justify-end">
                <div
                  className={` ${
                    currentTablesStates[9]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore
                    currentBlockedTables[9]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg  md:mr-8 m-2`}
                  //@ts-ignore
                  alt="table11"
                  data-size="4"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>11</h3>
                </div>
              </div>
              <div className="twenty bg-siva border-sivaBorder border-t-4 border-r-4 flex items-center pl-2 lg:pl-0">
                <div
                  className={` ${
                    currentTablesStates[14]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore
                    currentBlockedTables[14]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } rectangle-tables w-16 h-28 flex justify-center items-center border-2 shadow-lg rounded border-red-300 md:ml-8 m-2`}
                  //@ts-ignore
                  alt="table20"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>20</h3>
                </div>
              </div>
              <div className="two bg-siva border-sivaBorder border-l-4 flex justify-start">
                <div
                  className={` ${
                    currentTablesStates[1]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore

                    currentBlockedTables[1]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } rectangle-tables w-10 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:ml-8 m-2`}
                  //@ts-ignore
                  alt="table2"
                  data-size="2"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>2</h3>
                </div>
              </div>
              <div className="ten bg-siva border-sivaBorder border-r-4 flex justify-end pb-1">
                <div
                  className={` ${
                    currentTablesStates[8]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore

                    currentBlockedTables[8]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:mr-8 m-2`}
                  //@ts-ignore

                  alt="table10"
                  data-size="6"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>10</h3>
                </div>
              </div>

              <div className="one bg-siva border-sivaBorder border-l-4 flex justify-start pb-1">
                <div
                  className={` ${
                    currentTablesStates[0]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore

                    currentBlockedTables[0]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } rectangle-tables w-10 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:ml-8 m-2`}
                  //@ts-ignore
                  alt="table1"
                  data-size="2"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>1</h3>
                </div>
              </div>

              <div className="invisible-element-2 bg-siva border-sivaBorder flex justify-start border-r-4 border-t-4">
                <div
                  className="rectangle-tables w-16 h-10 flex justify-center items-center md:ml-8 m-2"
                  //@ts-ignore

                  alt="invisible"
                  onClick={(e) => changeTableState(e)}
                ></div>
              </div>

              {/* ---------- NY SOFIAS -------------- */}
              <div className="thirty bg-siva border-sivaBorder flex justify-start border-l-4 border-t-4">
                <div
                  className={` ${
                    currentTablesStates[15]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore
                    currentBlockedTables[15]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } round-tables w-12 h-12 border-2 rounded-full border-red-300 shadow-lg flex justify-center items-center md:ml-8 m-2 mt-2`}
                  //@ts-ignore
                  alt="table30"
                  data-size="5"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>30</h3>
                </div>
              </div>
              <div className="thirtyone bg-siva border-sivaBorder flex justify-start border-t-4 pl-8">
                <div
                  className={` ${
                    currentTablesStates[16]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore
                    currentBlockedTables[16]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } round-tables w-12 h-12 border-2 rounded-full border-red-300 shadow-lg flex justify-center items-center m-2 mt-2 ml-8`}
                  //@ts-ignore
                  alt="table31"
                  data-size="5"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>31</h3>
                </div>
              </div>
              <div className="fiftyoneandtwo bg-siva flex pt-1">
                <div className="bg-siva border-sivaBorder flex justify-start ">
                  <div
                    className={` ${
                      currentTablesStates[27]?.occupied === true
                        ? 'bg-rose '
                        : ''
                    }, ${
                      //@ts-ignore
                      currentBlockedTables[27]?.available === false
                        ? 'bg-sivaBlockedTable '
                        : ''
                    }  w-10 h-10 rotate-45 border-2 rounded border-red-300 shadow-lg flex justify-center items-center m-2 ml-8 `}
                    //@ts-ignore
                    alt="table52"
                    data-size="4"
                    onClick={(e) => changeTableState(e)}
                  >
                    <h3 className="-rotate-45 table52">52</h3>
                  </div>
                </div>
                <div className="bg-siva border-sivaBorder flex justify-start">
                  <div
                    className={` ${
                      currentTablesStates[26]?.occupied === true
                        ? 'bg-rose '
                        : ''
                    }, ${
                      //@ts-ignore
                      currentBlockedTables[26]?.available === false
                        ? 'bg-sivaBlockedTable '
                        : ''
                    }  w-10 h-10 rotate-45 border-2 rounded border-red-300 shadow-lg flex justify-center items-center m-2 ml-8`}
                    //@ts-ignore
                    alt="table51"
                    //@ts-ignore

                    data-size="4"
                    onClick={(e) => changeTableState(e)}
                  >
                    <h3 className="-rotate-45 table51">51</h3>
                  </div>
                </div>
              </div>
              <div className="thirtytwo bg-siva border-sivaBorder flex justify-end border-r-4 border-t-4">
                <div
                  className={` ${
                    currentTablesStates[17]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore
                    currentBlockedTables[17]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } rectangle-tables w-10 h-10 border-2 rounded border-red-300 shadow-lg flex justify-center items-center md:mr-8 m-2 mt-2 `}
                  //@ts-ignore
                  alt="table32"
                  data-size="2"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>32</h3>
                </div>
              </div>
              <div className="forty bg-siva border-sivaBorder flex justify-start border-l-4 ">
                <div
                  className={` ${
                    currentTablesStates[20]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore

                    currentBlockedTables[20]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } rectangle-tables w-16 h-10 border-2 rounded border-red-300 shadow-lg flex justify-center items-center md:ml-8 m-2 mt-2`}
                  //@ts-ignore

                  alt="table40"
                  data-size="4"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>40</h3>
                </div>
              </div>
              <div className="fifty bg-siva border-sivaBorder flex justify-start pl-8 ">
                <div
                  className={` ${
                    currentTablesStates[25]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore

                    currentBlockedTables[25]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } round-tables  w-12 h-12 border-2 rounded-full border-red-300 shadow-lg flex justify-center items-center m-2 mt-2 ml-8`}
                  //@ts-ignore

                  alt="table50"
                  data-size="6"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>50</h3>
                </div>
              </div>
              <div className="thirtythree bg-siva border-sivaBorder flex justify-end border-r-4">
                <div
                  className={` ${
                    currentTablesStates[18]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore

                    currentBlockedTables[18]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } rectangle-tables  w-10 h-10 border-2 rounded border-red-300 shadow-lg flex justify-center items-center md:mr-8 m-2 mt-2`}
                  alt="table33"
                  data-size="2"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>33</h3>
                </div>
              </div>
              <div className="fortyone bg-siva border-sivaBorder flex justify-start border-l-4">
                <div
                  className={` ${
                    currentTablesStates[21]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore

                    currentBlockedTables[21]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } rectangle-tables  w-16 h-10 border-2 rounded border-red-300 shadow-lg flex justify-center items-center md:ml-8 m-2 mt-2`}
                  //@ts-ignore

                  alt="table41"
                  data-size="4"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>41</h3>
                </div>
              </div>
              <div className="thirtyfour bg-siva border-sivaBorder flex justify-end border-r-4 ">
                <div
                  className={` ${
                    currentTablesStates[19]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore

                    currentBlockedTables[19]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } rectangle-tables  w-10 h-10 border-2 rounded border-red-300 shadow-lg  flex justify-center items-center md:mr-8 m-2 mt-2`}
                  //@ts-ignore

                  alt="table34"
                  data-size="2"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>34</h3>
                </div>
              </div>
              <div className="fortytwo bg-siva border-sivaBorder flex justify-start border-l-4 border-b-4 rounded-bl-lg">
                <div
                  className={` ${
                    currentTablesStates[22]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore

                    currentBlockedTables[22]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } rectangle-tables  w-16 h-10 border-2 rounded border-red-300 shadow-lg  flex justify-center items-center md:ml-8 m-2 mt-2`}
                  //@ts-ignore

                  alt="table42"
                  data-size="4"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>42</h3>
                </div>
              </div>
              <div className="fortythree bg-siva border-sivaBorder flex justify-start border-b-4 pl-6">
                <div
                  className={` ${
                    currentTablesStates[23]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore

                    currentBlockedTables[23]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } rectangle-tables w-16 h-10 border-2 rounded border-red-300 shadow-lg  flex justify-center items-center m-2 mt-2 ml-8`}
                  //@ts-ignore
                  alt="table43"
                  data-size="4"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>43</h3>
                </div>
              </div>
              <div className="fortyfour bg-siva border-sivaBorder flex justify-end border-b-4 border-r-4 rounded-br-lg">
                <div
                  className={` ${
                    currentTablesStates[24]?.occupied === true ? 'bg-rose ' : ''
                  }, ${
                    //@ts-ignore
                    currentBlockedTables[24]?.available === false
                      ? 'bg-sivaBlockedTable '
                      : ''
                  } rectangle-tables w-16 h-10 border-2 rounded border-red-300 shadow-lg  flex justify-center items-center md:mr-8 m-2 mt-2 mb-4`}
                  //@ts-ignore
                  alt="table44"
                  data-size="8"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3>44</h3>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
      //
    </>
  );
};

export default TableMap;
