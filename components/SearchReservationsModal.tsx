import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import Modal from '@mui/material/Modal';
import { useAppContext } from '../context/AppContext';
import TextField from '@mui/material/TextField';
import { format } from 'date-fns';
import _ from 'lodash';

const SearchReservationsModal = () => {
  const {
    showSearchReservations,
    showSearchReservationsModal,
    listOfAllTables,
    updateListOfAllTables,
    sendData,
    axiosFetch,
  } = useAppContext();

  const [nameToSearch, setNameToSearch] = useState('');
  const [reservationsList, setReservationsList] = useState([]);
  const [currentFoundReservations, setCurrentFoundReservations] = useState([]);
  const [currentTableToCancelReservation, setCurrentTableToCancelReservation] =
    useState({});
  const [searchAgainAllReservations, setSearchAgainAllReservations] =
    useState(false);

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
        return customer.name.toLowerCase() === nameToSearch.toLowerCase()
          ? customer
          : null;
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
  }, [nameToSearch, searchAgainAllReservations]);

  useEffect(() => {
    if (currentTableToCancelReservation) {
      cancelReservation();
      console.log(currentTableToCancelReservation, 'iz fun sto');
    }
  }, [currentTableToCancelReservation]);

  const cancelReservation = () => {
    const filterToFindOneToCancelReservation = listOfAllTables.map(
      (tableGroups) => {
        return tableGroups.tables.find((table) => {
          return table.id === currentTableToCancelReservation.tableNumber;
        });
      }
    );

    const removedCustomer =
      filterToFindOneToCancelReservation[0]?.customers.filter((customer) => {
        return customer.email !== currentTableToCancelReservation.email;
      });

    const removedCustomersTime =
      filterToFindOneToCancelReservation[0]?.reservedTimes.filter((time) => {
        return !_.isEqual(
          { start: new Date(time?.start), end: new Date(time?.end) },
          {
            start: new Date(currentTableToCancelReservation.time?.start),
            end: new Date(currentTableToCancelReservation.time?.end),
          }
        );
      });

    const updatedCustomersAndTimes = listOfAllTables.map((tableGroups) => {
      return tableGroups.tables.forEach((table) => {
        if (table.id === currentTableToCancelReservation.tableNumber) {
          table.customers = removedCustomer;
          table.reservedTimes = removedCustomersTime;
        }
      });
    });

    // updateListOfAllTables(updatedCustomersAndTimes);
    sendData();
    setSearchAgainAllReservations(!searchAgainAllReservations);

    // console.log(updatedCustomersAndTimes, 'updated customers');

    console.log(removedCustomer, 'sa uklonjenom musterijom');

    // if (filterToFindOneToCancelReservation[0]) {
    //   console.log('usao u if');
    //   const removedCustomer =
    //     filterToFindOneToCancelReservation[0].customers.filter((customer) => {
    //       return customer.email !== currentTableToCancelReservation.email ? customer : null;
    //     });

    //   console.log(removedCustomer, 'removedCUstomer usred ifa');

    //   const removedCustomerAndTime = removedCustomer.reservedTimes.filter(
    //     (time) => {
    //       const isTimeSlotReserved = _.isEqual(
    //         { start: new Date(time?.start), end: new Date(time?.end) },
    //         currentTableToCancelReservation.time
    //       );

    //       return isTimeSlotReserved === false ? time : null;
    //     }
    //   );
    // }

    console.log(filterToFindOneToCancelReservation, ' nakon svih promena sto');

    console.log(listOfAllTables, 'lista svih stolova nakon svih promena');

    // currentTableToCancelReservation
  };

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
    height: '80%',
    overflow: 'scroll',
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
        <Box sx={style} className="search-reservation-modal">
          <section className="relative">
            <div className="absolute top-0 right-0">
              <Button
                variant="outlined"
                size="small"
                sx={{ minWidth: 20, mb: 3 }}
                onClick={() => showSearchReservationsModal()}
              >
                <CloseIcon fontSize="small" />
              </Button>
            </div>
            <div className="flex flex-col mb-4">
              <h1 className="text-2xl mt-3 mb-6">RESERVASJON OVERSIKT</h1>

              <TextField
                id="outlined-basic"
                label="Søk etter navn"
                variant="outlined"
                value={nameToSearch}
                sx={{ maxWidth: '250px', placeSelf: 'center' }}
                onChange={(e) => searchByName(e)}
              />
              <div className="flex flex-wrap place-content-center">
                {currentFoundReservations.length > 0
                  ? currentFoundReservations.map((tableArrays) => {
                      return tableArrays.map((table, index) => {
                        if (table?.name.length > 0) {
                          const date = format(
                            new Date(table?.time.start),
                            'd. M. yyyy.'
                          );

                          console.log(table.time.start, 'gledaj vreme');
                          const reservedTimeStart = format(
                            new Date(table.time.start),
                            'H:mm'
                          );

                          const reservedTimeEnd = format(
                            new Date(table.time.end),
                            'H:mm'
                          );

                          return (
                            <ul
                              className="flex flex-col place-items-start mt-6 lg:mr-4 md:mr-4 sm:mr-2 p-8 max-w-max min-w-min border border-black[0.1] shadow-lg"
                              key={index}
                            >
                              <li>
                                <span className="font-semibold">
                                  BORD NUMMER:
                                </span>{' '}
                                {table.tableNumber}
                              </li>
                              <li className="name-in-reservation-list mt-2">
                                <span className="font-semibold">NAVN:</span>{' '}
                                {table.name}
                              </li>
                              <li className="mt-2">
                                <span className="font-semibold">EMAIL:</span>{' '}
                                {table.email}
                              </li>
                              <li className="mt-2">
                                <span className="font-semibold">DATO:</span>{' '}
                                {date}
                              </li>
                              <li className="mt-2">
                                <span className="font-semibold">
                                  FRA KLOKKA:
                                </span>{' '}
                                {reservedTimeStart}h
                              </li>
                              <li className="mt-2">
                                <span className="font-semibold">
                                  TIL KLOKKA:
                                </span>{' '}
                                {reservedTimeEnd}h
                              </li>

                              <Button
                                variant="contained"
                                sx={{
                                  minWidth: 20,
                                  padding: '8px',
                                  mt: 2,
                                  placeSelf: 'center',
                                }}
                                onClick={() =>
                                  setCurrentTableToCancelReservation(table)
                                }
                              >
                                Avbestille
                              </Button>
                            </ul>
                          );
                        }
                      });
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
