import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import TableOptionsModal from './TableOptionsModal';
import DateAdapter from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const TableMap = () => {
  const { listOfAllTables, showTableOptionsModal, tablesStates } =
    useAppContext();

  // const setTablesVisualState = tablesStates.map((item) => {
  //   return item.id ===
  // })

  const [currentTable, setCurrentTable] = useState({});
  const [currentTableSize, setCurrentTableSize] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());

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
      console.log('ide div');
    }

    if (e.target.nodeName === 'H3') {
      tableNumberClicked = +e.target.innerText;
      tableSize = +e.target.parentElement.dataset.size;
      console.log('ide h3');
    }

    console.log(tableNumberClicked, tableSize);

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

            <div className="date">
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
            </div>

            <div className="eight bg-siva border-sivaBorder border-t-4 border-l-4 flex justify-start ">
              <div
                className="rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:mt-4 md:ml-8 m-2 ring-1 ring-pink-300  ring-offset-2"
                alt="table8"
                data-size="4"
                onClick={(e) => changeTableState(e)}
              >
                <h3>8</h3>
              </div>
            </div>
            <div className="fifteen bg-siva border-sivaBorder border-t-4 border-r-4 flex justify-end">
              <div
                className="rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:mt-4 md:mr-8 m-2"
                alt="table15"
                data-size="4"
                onClick={(e) => changeTableState(e)}
              >
                <h3>15</h3>
              </div>
            </div>
            <div className="seven bg-siva border-sivaBorder border-l-4 flex justify-start border-b-4 pb-1">
              <div
                className="rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg  md:ml-8 m-2"
                alt="table7"
                data-size="4"
                onClick={(e) => changeTableState(e)}
              >
                <h3>7</h3>
              </div>
            </div>
            <div className="fourteen bg-siva border-sivaBorder border-r-4 flex justify-end border-b-4">
              <div
                className="rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:mr-8 m-2"
                alt="table14"
                data-size="4"
                onClick={(e) => changeTableState(e)}
              >
                <h3>14</h3>
              </div>
            </div>

            {/* --------- MIDTEN GAMLE SOFIAS ------------ */}

            <div className="six bg-siva border-sivaBorder border-l-4 items-center flex justify-start pt-1">
              <div
                className="rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg  md:ml-8 m-2"
                alt="table6"
                data-size="2"
                onClick={(e) => changeTableState(e)}
              >
                <h3>6</h3>
              </div>
            </div>
            <div className="thirteen bg-siva border-sivaBorder border-r-4 flex justify-end pt-1">
              <div
                className="rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:mr-8 m-2"
                alt="table13"
                data-size="4"
                onClick={(e) => changeTableState(e)}
              >
                <h3>13</h3>
              </div>
            </div>
            <div className="five bg-siva border-sivaBorder border-l-4 flex justify-start">
              <div
                className="rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:ml-8 m-2"
                alt="table5"
                data-size="4"
                onClick={(e) => changeTableState(e)}
              >
                <h3>5</h3>
              </div>
            </div>
            <div className="twelve bg-siva border-sivaBorder border-r-4 flex justify-end">
              <div
                className="rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:mr-8 m-2"
                alt="table12"
                data-size="12"
                onClick={(e) => changeTableState(e)}
              >
                <h3>12</h3>
              </div>
            </div>

            <div className="four bg-siva border-sivaBorder border-l-4 flex justify-start pb-1">
              <div
                className="rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:ml-8 m-2"
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

            {/* ---------- INGANG GAMLE SOFIAS ------------ */}

            <div className="three bg-siva border-sivaBorder border-l-4 flex justify-start pt-1 border-t-4">
              <div
                className="rectangle-tables w-10 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:ml-8 m-2"
                alt="table3"
                data-size="2"
                onClick={(e) => changeTableState(e)}
              >
                <h3>3</h3>
              </div>
            </div>
            <div className="eleven bg-siva border-sivaBorder border-r-4 flex justify-end">
              <div
                className="rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg  md:mr-8 m-2"
                alt="table11"
                data-size="4"
                onClick={(e) => changeTableState(e)}
              >
                <h3>11</h3>
              </div>
            </div>
            <div className="twenty bg-siva border-sivaBorder border-t-4 border-r-4 flex items-center pl-2 lg:pl-0">
              <div
                className="rectangle-tables w-16 h-28 flex justify-center items-center border-2 shadow-lg rounded border-red-300 md:ml-8 m-2"
                alt="table20"
                onClick={(e) => changeTableState(e)}
              >
                <h3>20</h3>
              </div>
            </div>
            <div className="two bg-siva border-sivaBorder border-l-4 flex justify-start">
              <div
                className="rectangle-tables w-10 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:ml-8 m-2"
                alt="table2"
                data-size="2"
                onClick={(e) => changeTableState(e)}
              >
                <h3>2</h3>
              </div>
            </div>
            <div className="ten bg-siva border-sivaBorder border-r-4 flex justify-end pb-1">
              <div
                className="rectangle-tables w-16 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:mr-8 m-2"
                alt="table10"
                data-size="6"
                onClick={(e) => changeTableState(e)}
              >
                <h3>10</h3>
              </div>
            </div>

            <div className="one bg-siva border-sivaBorder border-l-4 flex justify-start pb-1">
              <div
                className="rectangle-tables w-10 h-10 flex justify-center items-center border-2 rounded border-red-300 shadow-lg md:ml-8 m-2"
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
                className="round-tables w-12 h-12 border-2 rounded-full border-red-300 shadow-lg flex justify-center items-center md:ml-8 m-2 mt-2"
                alt="table30"
                data-size="5"
                onClick={(e) => changeTableState(e)}
              >
                <h3>30</h3>
              </div>
            </div>
            <div className="thirtyone bg-siva border-sivaBorder flex justify-start border-t-4 pl-8">
              <div
                className="pet round-tables w-12 h-12 border-2 rounded-full border-red-300 shadow-lg flex justify-center items-center m-2 mt-2 ml-8"
                alt="table31"
                data-size="5"
                onClick={(e) => changeTableState(e)}
              >
                <h3>31</h3>
              </div>
            </div>
            {/* <div className="invisible-element-3 border-sivaBorder flex justify-start border-t-4">
              <div
                className="rectangle-tables w-24 h-14 flex justify-center items-center m-4 ml-8 "
                alt="invisible"
                onClick={(e) => changeTableState(e)}
              ></div>
            </div> */}
            <div className="fiftyoneandtwo bg-siva flex pt-1">
              <div className="bg-siva border-sivaBorder flex justify-start ">
                <div
                  className="rectangle-tables w-10 h-10 rotate-45 border-2 rounded border-red-300 shadow-lg flex justify-center items-center m-2 ml-8"
                  alt="table52"
                  data-size="4"
                  onClick={(e) => changeTableState(e)}
                >
                  <h3 className="-rotate-45">52</h3>
                </div>
              </div>
              <div className="bg-siva border-sivaBorder flex justify-start">
                <div
                  className="rectangle-tables w-10 h-10 rotate-45 border-2 rounded border-red-300 shadow-lg flex justify-center items-center m-2 ml-8"
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
                className="rectangle-tables w-10 h-10 border-2 rounded border-red-300 shadow-lg flex justify-center items-center md:mr-8 m-2 mt-2"
                alt="table32"
                data-size="2"
                onClick={(e) => changeTableState(e)}
              >
                <h3>32</h3>
              </div>
            </div>
            <div className="forty bg-siva border-sivaBorder flex justify-start border-l-4 ">
              <div
                className="rectangle-tables w-16 h-10 border-2 rounded border-red-300 shadow-lg flex justify-center items-center md:ml-8 m-2 mt-2"
                alt="table40"
                data-size="4"
                onClick={(e) => changeTableState(e)}
              >
                <h3>40</h3>
              </div>
            </div>
            <div className="fifty bg-siva border-sivaBorder flex justify-start pl-8 ">
              <div
                className="round-tables  w-12 h-12 border-2 rounded-full border-red-300 shadow-lg flex justify-center items-center m-2 mt-2 ml-8"
                alt="table50"
                data-size="6"
                onClick={(e) => changeTableState(e)}
              >
                <h3>50</h3>
              </div>
            </div>
            <div className="thirtythree bg-siva border-sivaBorder flex justify-end border-r-4">
              <div
                className="rectangle-tables  w-10 h-10 border-2 rounded border-red-300 shadow-lg flex justify-center items-center md:mr-8 m-2 mt-2"
                alt="table33"
                data-size="2"
                onClick={(e) => changeTableState(e)}
              >
                <h3>33</h3>
              </div>
            </div>
            <div className="fortyone bg-siva border-sivaBorder flex justify-start border-l-4">
              <div
                className="rectangle-tables  w-16 h-10 border-2 rounded border-red-300 shadow-lg flex justify-center items-center md:ml-8 m-2 mt-2"
                alt="table41"
                data-size="4"
                onClick={(e) => changeTableState(e)}
              >
                <h3>41</h3>
              </div>
            </div>
            <div className="thirtyfour bg-siva border-sivaBorder flex justify-end border-r-4 ">
              <div
                className="rectangle-tables  w-10 h-10 border-2 rounded border-red-300 shadow-lg  flex justify-center items-center md:mr-8 m-2 mt-2"
                alt="table34"
                data-size="2"
                onClick={(e) => changeTableState(e)}
              >
                <h3>34</h3>
              </div>
            </div>
            <div className="fortytwo bg-siva border-sivaBorder flex justify-start border-l-4 border-b-4 ">
              <div
                className="rectangle-tables  w-16 h-10 border-2 rounded border-red-300 shadow-lg  flex justify-center items-center md:ml-8 m-2 mt-2"
                alt="table42"
                data-size="4"
                onClick={(e) => changeTableState(e)}
              >
                <h3>42</h3>
              </div>
            </div>
            <div className="fortythree bg-siva border-sivaBorder flex justify-start border-b-4 pl-6">
              <div
                className="rectangle-tables w-16 h-10 border-2 rounded border-red-300 shadow-lg  flex justify-center items-center m-2 mt-2 ml-8"
                alt="table43"
                data-size="4"
                onClick={(e) => changeTableState(e)}
              >
                <h3>43</h3>
              </div>
            </div>
            {/* <div className="invisible-element-4 border-sivaBorder flex justify-start border-b-4">
              <div
                className="rectangle-tables w-24 h-14 flex justify-center items-center m-4 ml-8 flex justify-center items-center"
                alt="invisible"
                onClick={(e) => changeTableState(e)}
              ></div>
            </div> */}
            <div className="fortyfour bg-siva border-sivaBorder flex justify-end border-b-4 border-r-4">
              <div
                className="rectangle-tables w-16 h-10 border-2 rounded border-red-300 shadow-lg  flex justify-center items-center md:mr-8 m-2 mt-2 mb-4"
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
