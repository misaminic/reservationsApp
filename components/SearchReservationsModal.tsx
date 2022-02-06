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
  }: any = useAppContext();

  const [nameToSearch, setNameToSearch] = useState<any>('');
  const [reservationsList, setReservationsList] = useState<any>([]);
  const [currentFoundReservations, setCurrentFoundReservations] = useState<any>(
    []
  );
  const [currentTableToCancelReservation, setCurrentTableToCancelReservation] =
    useState<any>({});
  const [searchAgainAllReservations, setSearchAgainAllReservations] =
    useState<any>(false);

  const searchByName = (e: any) => {
    const name = e.target.value;
    setNameToSearch(name);
  };

  useEffect(() => {
    //@ts-ignore
    const allTables = [];

    listOfAllTables.forEach((tableGroups: any) => {
      return tableGroups.tables.forEach((table: any) => {
        return allTables.push(table);
      });
    });
    {
      /* @ts-ignore */
    }
    const foundCustomersInReservations = allTables.map((table) => {
      return table.customers.map((customer: any) => {
        return customer.name.toLowerCase() === nameToSearch.toLowerCase()
          ? customer
          : null;
      });
    });

    const foundReservationsWithoutFalsyValues =
      foundCustomersInReservations.filter((item) => {
        return item.length > 0;
      });

    setCurrentFoundReservations(foundReservationsWithoutFalsyValues);
  }, [nameToSearch, searchAgainAllReservations]);

  useEffect(() => {
    if (currentTableToCancelReservation) {
      cancelReservation();
    }
  }, [currentTableToCancelReservation]);

  const cancelReservation = () => {
    const filterToFindOneToCancelReservation = listOfAllTables.map(
      (tableGroups: any) => {
        return tableGroups.tables.find((table: any) => {
          return table.id === currentTableToCancelReservation.tableNumber;
        });
      }
    );

    const removedCustomer =
      filterToFindOneToCancelReservation[0]?.customers.filter(
        (customer: any) => {
          return customer.email !== currentTableToCancelReservation.email;
        }
      );

    const removedCustomersTime =
      filterToFindOneToCancelReservation[0]?.reservedTimes.filter(
        (time: any) => {
          return !_.isEqual(
            { start: new Date(time?.start), end: new Date(time?.end) },
            {
              start: new Date(currentTableToCancelReservation.time?.start),
              end: new Date(currentTableToCancelReservation.time?.end),
            }
          );
        }
      );

    const updatedCustomersAndTimes = listOfAllTables.map((tableGroups: any) => {
      return tableGroups.tables.forEach((table: any) => {
        if (table.id === currentTableToCancelReservation.tableNumber) {
          table.customers = removedCustomer;
          table.reservedTimes = removedCustomersTime;
        }
      });
    });

    sendData();
    setSearchAgainAllReservations(!searchAgainAllReservations);
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

  return (
    <>
      <Modal
        open={showSearchReservations}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {/* @ts-ignore */}
        <Box sx={style} className="search-reservation-modal">
          <section className="relative">
            <div className="absolute top-0 right-0">
              {/* @ts-ignore */}
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
                  ? currentFoundReservations.map((tableArrays: any) => {
                      return tableArrays.map((table: any, index: any) => {
                        if (table?.name.length > 0) {
                          const date = format(
                            new Date(table?.time.start),
                            'd. M. yyyy.'
                          );

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
