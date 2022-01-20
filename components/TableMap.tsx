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
import { addDays, subDays, addHours, subHours } from 'date-fns';
import _ from 'lodash';
import tables from '../amountOfTables';
import MobileTimePicker from '@mui/lab/MobileTimePicker';

const TableMap = () => {
  const {
    listOfAllTables,
    showTableOptionsModal,
    tablesStates,
    setDate,
    dataFromDb,
    // currentDate,
  } = useAppContext();

  // const setTablesVisualState = tablesStates.map((item) => {
  //   return item.id ===
  // })

  console.log(dataFromDb, 'data iz DB');

  // const timeAlreadyUsed = table.reservedTimes.some((time) => {
  //   const timeSlotReserved = _.isEqual(
  //     { start: new Date(time?.start), end: new Date(time?.end) },
  //     timeStartEndUserInput
  //   );
  //   return timeSlotReserved === true;
  // });

  // if (timeAlreadyUsed === true) {
  //   showTableAvailabilityMsg(
  //     true,
  //     `Valgt tidspunktet er ikke ledig, prøv gjerne et annet tidspunkt.`
  //   );
  // }

  // if (timeAlreadyUsed === false) {
  //   const areTimesOverlapping = table.reservedTimes.find((time) => {
  //     const checkIfTimesOverlapping = areIntervalsOverlapping(
  //       { start: new Date(time?.start), end: new Date(time?.end) },
  //       timeStartEndUserInput,
  //       {
  //         inclusive: true,
  //       }
  //     );

  //     return checkIfTimesOverlapping === true;
  //   });

  //   if (areTimesOverlapping === true) {
  //     showTableAvailabilityMsg(
  //       true,
  //       `Valgt tidspunktet er ikke ledig, prøv gjerne et annet tidspunkt.`
  //     );
  //   }

  const [currentTable, setCurrentTable] = useState({});
  const [currentTableSize, setCurrentTableSize] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTablesStates, setCurrentTableStates] = useState({});
  const [currentArrivingTime, setCurrentArrivingTime] = useState(new Date());
  const [currentLeavingTime, setCurrentLeavingTime] = useState(new Date());

  useEffect(() => {
    if (currentDate) {
      const dateFormatDbReady = currentDate.toString().slice(0, 15);
      setDate(dateFormatDbReady);
    }
    console.log(dataFromDb.data?.reservations, 'PROMENA DATUMA');
  }, [currentDate]);

  useEffect(() => {
    console.log(listOfAllTables, 'lista svih stolova');
    let allTablesThatHaveSomeTimeReserved = listOfAllTables.map(
      (tableGroups) => {
        return tableGroups.tables.map((table) => {
          console.log(table);
          return table.reservedTimes.length > 0 ? table.id : null;
        });
      }
    );
    const withoutFalseValues = allTablesThatHaveSomeTimeReserved.map(
      (arrayOfTables) => {
        return _.compact(arrayOfTables);
      }
    );

    let reservedTablesIds = [];

    if (withoutFalseValues) {
      withoutFalseValues.map((arrayOfTables) => {
        console.log(arrayOfTables, 'ovo je jedna grupa');
        return arrayOfTables.map((item) => {
          return reservedTablesIds.push(item);
        });
      });
    }

    let currentTablesToChangeAvailability = { ...tablesStates };

    if (reservedTablesIds.length > 0) {
      const reservedTablesToChangeState = reservedTablesIds.map((id) => {
        // return console.log(tablesStates, 'ovo su tableState');
        return _.filter(currentTablesToChangeAvailability, { id: id });
      });

      reservedTablesToChangeState.forEach((tableGroup) => {
        return tableGroup.forEach((table) => {
          return (table.occupied = true);
        });
      });

      setCurrentTableStates(currentTablesToChangeAvailability);

      console.log(reservedTablesToChangeState);
      // console.log(currentReservedTablesToChangeState, 'ovo je bla');

      console.log(currentTablesStates, 'ovo Trazis');
    }

    // console.log(
    //   availableTablesIds,
    //   'filtrirani samo oni koji imaju rezervacije'
    // );
  }, [listOfAllTables]);

  // add or subtract one day from a current date by clicking on chevrons
  const changeDayHandlerPlus = (e) => {
    setCurrentDate((prevState) => addDays(new Date(prevState), 1));
  };

  const changeDayHandlerMinus = (e) => {
    setCurrentDate((prevState) => subDays(new Date(prevState), 1));
  };

  const changeHourHandlerPlusArrivingTime = (e) => {
    setCurrentArrivingTime((prevState) => addHours(new Date(prevState), 1));
  };

  const changeHourHandlerMinusArrivingTime = (e) => {
    setCurrentArrivingTime((prevState) => subHours(new Date(prevState), 1));
  };

  const changeHourHandlerPlusLeavingTime = (e) => {
    setCurrentLeavingTime((prevState) => addHours(new Date(prevState), 1));
  };

  const changeHourHandlerMinusLeavingTime = (e) => {
    setCurrentLeavingTime((prevState) => subHours(new Date(prevState), 1));
  };

  // Adding restaurant overview options - which tables are available at a given time

  // Manipulate table, book and cancel reservation
  const changeTableState = (e) => {
    let tableNumberClicked;
    let tableSize;

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
      const allTablesForTheGroupSize = listOfAllTables.find((tables) => {
        console.log(tables.key, tableSize);
        return tables.key === tableSize;
      });

      // then find the table that is clicked
      const clickedTable = allTablesForTheGroupSize.tables.find((table) => {
        return table.id === tableNumberClicked;
      });

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

      <div className="restaurant-map w-max h-max justify-center justify-items-center justify-self-center mt-8 mb-8 mx-auto">
        <div className="restaurant-map__inner">
          <div className="sitting-area max-w-screen max-h-screen grid md:grid-cols-4 sm:grid-cols-3 m-4">
            {/* -----------  GAMLE SOFIAS ----------- */}

            <div className="date flex justify-self-center mb-4">
              <Button
                variant="outlined"
                size="small"
                className="mr-8"
                onClick={(e) => changeDayHandlerMinus(e)}
              >
                <ChevronLeftIcon />
              </Button>

              <LocalizationProvider dateAdapter={DateAdapter}>
                {
                  <Stack spacing={3}>
                    <DatePicker
                      label="Velg dato"
                      minDate={new Date()}
                      maxDate={new Date('2022-01-30T21:00')}
                      inputFormat="dd/MM/yyyy"
                      disablePast
                      value={currentDate}
                      onChange={(date) => {
                        setCurrentDate(date);
                      }}
                      renderInput={(props) => <TextField {...props} />}
                    />
                  </Stack>
                }
              </LocalizationProvider>
              <Button variant="outlined" size="small" className="ml-8">
                <ChevronRightIcon onClick={(e) => changeDayHandlerPlus(e)} />
              </Button>
            </div>

            <div className="arrivingTime flex justify-self-center mb-4">
              <Button
                variant="outlined"
                size="small"
                className="mr-8"
                onClick={(e) => changeHourHandlerMinusArrivingTime(e)}
              >
                <ChevronLeftIcon />
              </Button>

              <LocalizationProvider dateAdapter={DateAdapter}>
                {
                  <Stack spacing={3}>
                    <MobileTimePicker
                      label="Velg ankomst tid"
                      minTime={new Date(0, 0, 0, 12)}
                      maxTime={new Date(0, 0, 0, 21, 0)}
                      disablePast
                      ampm={false}
                      minutesStep={15}
                      value={currentArrivingTime}
                      onChange={(time) => {
                        setCurrentArrivingTime(time);
                      }}
                      renderInput={(props) => <TextField {...props} />}
                    />
                  </Stack>
                }
              </LocalizationProvider>
              <Button variant="outlined" size="small" className="ml-8">
                <ChevronRightIcon
                  onClick={(e) => changeHourHandlerPlusArrivingTime(e)}
                />
              </Button>
            </div>

            <div className="leavingTime flex justify-self-center mb-4">
              <Button
                variant="outlined"
                size="small"
                className="mr-8"
                onClick={(e) => changeHourHandlerMinusLeavingTime(e)}
              >
                <ChevronLeftIcon />
              </Button>

              <LocalizationProvider dateAdapter={DateAdapter}>
                {
                  <Stack spacing={3}>
                    <MobileTimePicker
                      label="Velg avreise tid"
                      minTime={new Date(0, 0, 0, 12)}
                      maxTime={new Date(0, 0, 0, 21, 0)}
                      disablePast
                      ampm={false}
                      minutesStep={15}
                      value={currentLeavingTime}
                      onChange={(time) => {
                        setCurrentLeavingTime(time);
                      }}
                      renderInput={(props) => <TextField {...props} />}
                    />
                  </Stack>
                }
              </LocalizationProvider>
              <Button variant="outlined" size="small" className="ml-8">
                <ChevronRightIcon
                  onClick={(e) => changeHourHandlerPlusLeavingTime(e)}
                />
              </Button>
            </div>

            <div className="eight bg-siva border-sivaBorder border-t-4 border-l-4 flex justify-start ">
              <div
                className={` ${
                  currentTablesStates[7]?.occupied === true ? 'bg-rose ' : ''
                }
                rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:mt-4 md:ml-8 m-2`}
                alt="table8"
                data-size="4"
                onClick={(e) => changeTableState(e)}
              >
                <h3>8</h3>
              </div>
            </div>
            <div className="fifteen bg-siva border-sivaBorder border-t-4 border-r-4 flex justify-end">
              <div
                className={` ${
                  currentTablesStates[13]?.occupied === true ? 'bg-rose ' : ''
                }rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:mt-4 md:mr-8 m-2`}
                alt="table15"
                data-size="4"
                onClick={(e) => changeTableState(e)}
              >
                <h3>15</h3>
              </div>
            </div>
            <div className="invisible-element-3 bg-siva border-sivaBorder flex justify-start border-t-4 border-r-4 pb-1">
              <div
                className="rectangle-tables w-16 h-10 flex justify-center items-center md:ml-8 m-2"
                alt="invisible"
                onClick={(e) => changeTableState(e)}
              ></div>
            </div>
            <div className="seven bg-siva border-sivaBorder border-l-4 flex justify-start border-b-4 pb-1">
              <div
                className={` ${
                  currentTablesStates[6]?.occupied === true ? 'bg-rose ' : ''
                }rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg  md:ml-8 m-2`}
                alt="table7"
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
                } rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:mr-8 m-2`}
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
                alt="invisible"
                onClick={(e) => changeTableState(e)}
              ></div>
            </div>

            {/* --------- MIDTEN GAMLE SOFIAS ------------ */}

            <div className="six bg-siva border-sivaBorder border-l-4 items-center flex justify-start pt-1">
              <div
                className={` ${
                  currentTablesStates[5]?.occupied === true ? 'bg-rose ' : ''
                } rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg  md:ml-8 m-2`}
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
                } rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:mr-8 m-2`}
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
                alt="invisible"
                onClick={(e) => changeTableState(e)}
              ></div>
            </div>
            <div className="five bg-siva border-sivaBorder border-l-4 flex justify-start">
              <div
                className={` ${
                  currentTablesStates[4]?.occupied === true ? 'bg-rose ' : ''
                } rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:ml-8 m-2`}
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
                } rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:mr-8 m-2`}
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
                } rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:ml-8 m-2`}
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
                alt="invisible"
                onClick={(e) => changeTableState(e)}
              ></div>
            </div>
            <div className="invisible-element-7 bg-siva border-sivaBorder flex justify-start border-r-4 pb-1">
              <div
                className="rectangle-tables w-16 h-10 flex justify-center items-center md:ml-8 m-2"
                alt="invisible"
                onClick={(e) => changeTableState(e)}
              ></div>
            </div>

            {/* ---------- INGANG GAMLE SOFIAS ------------ */}

            <div className="three bg-siva border-sivaBorder border-l-4 flex justify-start pt-1 border-t-4">
              <div
                className={` ${
                  currentTablesStates[2]?.occupied === true ? 'bg-rose ' : ''
                } rectangle-tables w-10 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:ml-8 m-2`}
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
                } rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg  md:mr-8 m-2`}
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
                } rectangle-tables w-16 h-28 flex justify-center items-center border-2 shadow-lg rounded border-red-300 md:ml-8 m-2`}
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
                } rectangle-tables w-10 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:ml-8 m-2`}
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
                } rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:mr-8 m-2`}
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
                } rectangle-tables w-10 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:ml-8 m-2`}
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
                alt="invisible"
                onClick={(e) => changeTableState(e)}
              ></div>
            </div>

            {/* ---------- NY SOFIAS -------------- */}
            <div className="thirty bg-siva border-sivaBorder flex justify-start border-l-4 border-t-4">
              <div
                className={` ${
                  currentTablesStates[15]?.occupied === true ? 'bg-rose ' : ''
                } round-tables w-12 h-12 border-2 rounded-full border-red-300 shadow-lg flex justify-center items-center md:ml-8 m-2 mt-2`}
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
                } round-tables w-12 h-12 border-2 rounded-full border-red-300 shadow-lg flex justify-center items-center m-2 mt-2 ml-8`}
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
                    currentTablesStates[27]?.occupied === true ? 'bg-rose ' : ''
                  } rectangle-tables w-10 h-10 rotate-45 border-2 rounded border-red-300 shadow-lg flex justify-center items-center m-2 ml-8 `}
                  alt="table52"
                  data-size="4"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3 className="-rotate-45">52</h3>
                </div>
              </div>
              <div className="bg-siva border-sivaBorder flex justify-start">
                <div
                  className={` ${
                    currentTablesStates[26]?.occupied === true ? 'bg-rose ' : ''
                  } rectangle-tables w-10 h-10 rotate-45 border-2 rounded border-red-300 shadow-lg flex justify-center items-center m-2 ml-8`}
                  alt="table51"
                  data-size="4"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3 className="-rotate-45">51</h3>
                </div>
              </div>
            </div>
            <div className="thirtytwo bg-siva border-sivaBorder flex justify-end border-r-4 border-t-4">
              <div
                className={` ${
                  currentTablesStates[17]?.occupied === true ? 'bg-rose ' : ''
                } rectangle-tables w-10 h-10 border-2 rounded border-red-300 shadow-lg flex justify-center items-center md:mr-8 m-2 mt-2 `}
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
                } rectangle-tables w-16 h-10 border-2 rounded border-red-300 shadow-lg flex justify-center items-center md:ml-8 m-2 mt-2`}
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
                } round-tables  w-12 h-12 border-2 rounded-full border-red-300 shadow-lg flex justify-center items-center m-2 mt-2 ml-8`}
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
                } rectangle-tables  w-16 h-10 border-2 rounded border-red-300 shadow-lg flex justify-center items-center md:ml-8 m-2 mt-2`}
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
                } rectangle-tables  w-10 h-10 border-2 rounded border-red-300 shadow-lg  flex justify-center items-center md:mr-8 m-2 mt-2`}
                alt="table34"
                data-size="2"
                onClick={(e) => changeTableState(e)}
              >
                <h3>34</h3>
              </div>
            </div>
            <div className="fortytwo bg-siva border-sivaBorder flex justify-start border-l-4 border-b-4 ">
              <div
                className={` ${
                  currentTablesStates[22]?.occupied === true ? 'bg-rose ' : ''
                } rectangle-tables  w-16 h-10 border-2 rounded border-red-300 shadow-lg  flex justify-center items-center md:ml-8 m-2 mt-2`}
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
                } rectangle-tables w-16 h-10 border-2 rounded border-red-300 shadow-lg  flex justify-center items-center m-2 mt-2 ml-8`}
                alt="table43"
                data-size="4"
                onClick={(e) => changeTableState(e)}
              >
                <h3>43</h3>
              </div>
            </div>
            <div className="fortyfour bg-siva border-sivaBorder flex justify-end border-b-4 border-r-4">
              <div
                className={` ${
                  currentTablesStates[24]?.occupied === true ? 'bg-rose ' : ''
                } rectangle-tables w-16 h-10 border-2 rounded border-red-300 shadow-lg  flex justify-center items-center md:mr-8 m-2 mt-2 mb-4`}
                alt="table44"
                data-size="8"
                onClick={(e) => changeTableState(e)}
              >
                <h3>44</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TableMap;
