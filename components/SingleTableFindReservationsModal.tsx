import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import Modal from '@mui/material/Modal';
import { useAppContext } from '../context/AppContext';
import TextField from '@mui/material/TextField';
import { format } from 'date-fns';
import _ from 'lodash';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const SingleTableFindReservationsModal = ({ table, previousPart }) => {
  const {
    showSingleTableReservations,
    listOfAllTables,
    showSingleTableReservationsModal,
    updateListOfAllTables,
    sendData,
    tableOptionsModalPart,
    changeTableOptionsModalPart,
  } = useAppContext();

  const [currentFoundReservations, setCurrentFoundReservations] = useState([]);
  // const [currentTableToCancelReservation, setCurrentTableToCancelReservation] =
  //   useState({});
  const [searchAgainAllReservations, setSearchAgainAllReservations] =
    useState(false);

  useEffect(() => {
    const tempTable = listOfAllTables.map((tableGroups) => {
      return tableGroups.tables.find((tableFromDb) => {
        return tableFromDb.id === table.id;
      });
    });

    setCurrentFoundReservations(tempTable[0]);
  }, [searchAgainAllReservations]);

  const cancelReservation = (
    clickedCustomerReservationEmail,
    clickedCustomerReservationTimeStart,
    clickedCustomerReservationTimeEnd
  ) => {
    const filterToFindOneToCancelReservation = listOfAllTables.map(
      (tableGroups) => {
        return tableGroups.tables.find((tableFromDb) => {
          return tableFromDb.id === table.id;
        });
      }
    );

    const removedCustomer =
      filterToFindOneToCancelReservation[0]?.customers.filter((customer) => {
        return !_.isEqual(
          {
            start: new Date(customer.time?.start),
            end: new Date(customer.time?.end),
          },
          {
            start: new Date(clickedCustomerReservationTimeStart),
            end: new Date(clickedCustomerReservationTimeEnd),
          }
        );
      });

    console.log(removedCustomer, 'prvi korak da li je sto tu');

    const removedCustomersTime =
      filterToFindOneToCancelReservation[0]?.reservedTimes.filter((time) => {
        return !_.isEqual(
          { start: new Date(time?.start), end: new Date(time?.end) },
          {
            start: new Date(clickedCustomerReservationTimeStart),
            end: new Date(clickedCustomerReservationTimeEnd),
          }
        );
      });

    console.log(removedCustomersTime, 'vreme SadE');

    const updatedCustomersAndTimes = listOfAllTables.map((tableGroups) => {
      return tableGroups.tables.forEach((tableFromDb) => {
        if (tableFromDb.id === table.id) {
          table.customers = removedCustomer;
          table.reservedTimes = removedCustomersTime;
        }
      });
    });

    sendData();
    setSearchAgainAllReservations(!searchAgainAllReservations);

    console.log(removedCustomer, 'sa uklonjenom musterijom');

    console.log(filterToFindOneToCancelReservation, ' nakon svih promena sto');

    console.log(listOfAllTables, 'lista svih stolova nakon svih promena');

    // currentTableToCancelReservation
  };

  useEffect(() => {
    showSingleTableReservationsModal();
  }, []);

  const previousModalPart = () => {
    changeTableOptionsModalPart(0);
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
        open={showSingleTableReservations}
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
                onClick={(e) => showSingleTableReservationsModal(e)}
              >
                <CloseIcon fontSize="small" />
              </Button>
            </div>
            <div className="absolute top-0 left-0">
              <Button
                variant="outlined"
                sx={{ minWidth: 20, mb: 3 }}
                onClick={() => previousModalPart()}
              >
                <ArrowBackIcon fontSize="small" />
              </Button>
            </div>
            <div className="flex flex-col mb-4">
              <h1 className="text-2xl mt-3 mb-6">RESERVASJON OVERSIKT</h1>

              <div className="flex flex-wrap place-content-center">
                {currentFoundReservations?.customers?.length ? (
                  currentFoundReservations.customers.map((customer, index) => {
                    if (customer?.name.length > 0) {
                      const date = format(
                        new Date(customer?.time.start),
                        'd. M. yyyy.'
                      );

                      const reservedTimeStart = format(
                        new Date(customer.time.start),
                        'H:mm'
                      );

                      const reservedTimeEnd = format(
                        new Date(customer.time.end),
                        'H:mm'
                      );

                      return (
                        <ul
                          className="flex flex-col place-items-start mt-6 lg:mr-4 md:mr-4 sm:mr-2 p-8 max-w-max min-w-min border border-black[0.1] shadow-lg"
                          key={index}
                        >
                          <li>
                            <span className="font-semibold">BORD NUMMER:</span>{' '}
                            {table.id}
                          </li>
                          <li className="name-in-reservation-list mt-2">
                            <span className="font-semibold">NAVN:</span>{' '}
                            {customer.name}
                          </li>
                          <li className="mt-2">
                            <span className="font-semibold">EMAIL:</span>{' '}
                            {customer.email}
                          </li>
                          <li className="mt-2">
                            <span className="font-semibold">DATO:</span> {date}
                          </li>
                          <li className="mt-2">
                            <span className="font-semibold">FRA KLOKKA:</span>{' '}
                            {reservedTimeStart}h
                          </li>
                          <li className="mt-2">
                            <span className="font-semibold">TIL KLOKKA:</span>{' '}
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
                              cancelReservation(
                                customer.email,
                                customer.time.start,
                                customer.time.end
                              )
                            }
                          >
                            Avbestille
                          </Button>
                        </ul>
                      );
                    }
                  })
                ) : (
                  <h3>Det finnes ingen reservasjon på dette bordet</h3>
                )}
              </div>
            </div>
          </section>
        </Box>
      </Modal>
    </>
  );
};

export default SingleTableFindReservationsModal;
