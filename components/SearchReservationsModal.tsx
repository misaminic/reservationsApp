import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import Modal from '@mui/material/Modal';
import { useAppContext } from '../context/AppContext';
import TextField from '@mui/material/TextField';
import { format } from 'date-fns';

const SearchReservationsModal = () => {
  const {
    showSearchReservations,
    listOfAllTables,
    updateListOfAllTables,
    sendData,
    axiosFetch,
  } = useAppContext();

  const [nameToSearch, setNameToSearch] = useState('');
  const [reservationsList, setReservationsList] = useState([]);
  const [currentFoundReservations, setCurrentFoundReservations] = useState([]);

  const searchByName = (e) => {
    const name = e.target.value;
    setNameToSearch(name);
  };

  useEffect(() => {
    const allTables = [];

    listOfAllTables.forEach((tableGroups) => {
      return tableGroups.tables.forEach((table) => {
        return allTables.push(table);
      });
    });

    const foundCustomersInReservations = allTables.map((table) => {
      return table.customers.map((customer) => {
        return customer.name === nameToSearch ? customer : null;
      });
    });

    const foundReservationsWithoutFalsyValues =
      foundCustomersInReservations.filter((item) => {
        return item.length > 0;
      });

    console.log(foundReservationsWithoutFalsyValues, 'ovo ti je ime pretraga');

    setCurrentFoundReservations(foundReservationsWithoutFalsyValues);

    //   Nasao si ime odnosno sto, sad ispisi u modalu taj sto, omoguci klik na njega
    // i reci obrisi rezervaciju - a to znaci uzmi vreme te rezervacije i uzmi ceo STO na kom je uradjena rezervacija
    // pronadji to vreme i obrisi ga iz reservedTimes i zatim izbrisi i korisnika skroz iz customers i to je onda to
    // :) :) :)
  }, [nameToSearch]);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100vw',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  useEffect(() => {
    console.log(currentFoundReservations, 'trenutno pronadjeno');
  }, [currentFoundReservations]);

  return (
    <>
      <Modal
        open={showSearchReservations}
        // onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <section>
            <div className="flex flex-col mb-4">
              <TextField
                id="outlined-basic"
                label="Søk etter navn"
                variant="outlined"
                value={nameToSearch}
                onChange={(e) => searchByName(e)}
              />
              <div>
                {currentFoundReservations.length > 0
                  ? currentFoundReservations.map((table, index) => {
                      if (table[index] !== null) {
                        const date = format(
                          table[index].time.start,
                          'd:M:yyyy'
                        );

                        //  const date =
                        //   .toString()
                        //   .slice(0, 10);

                        const date = [...getDate].reverse();

                        const reservedTimeStart = table[index].time.start
                          .toString()
                          .slice(11, 16);
                        const reservedTimeEnd = table[index].time.end
                          .toString()
                          .slice(11, 16);
                        return (
                          <ul
                            className="flex flex-col place-items-start"
                            key={index}
                          >
                            <li>BORD NUMMER: {table[index].tableNumber}</li>
                            <li>NAVN: {table[index].name}</li>
                            <li>EMAIL: {table[index].email}</li>
                            <li>DATO: {date}</li>
                            <li>FRA KLOKKA: {reservedTimeStart}</li>
                            <li>TIL KLOKKA: {reservedTimeEnd}</li>
                          </ul>
                        );
                      }
                    })
                  : null}
              </div>
            </div>
          </section>
        </Box>
      </Modal>
    </>
  );
};

export default SearchReservationsModal;
