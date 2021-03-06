import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Modal from '@mui/material/Modal';
import { useAppContext } from '../context/AppContext';
import BookTableManually from './BookTableManually';
import MsgModal from '../components/MsgModal';
import SingleTableFindReservationsModal from '../components/SingleTableFindReservationsModal';

// type msgTypes = { show?: boolean; msg?: string };

const TableOptionsModal = ({ table, size }: any) => {
  const {
    tableOptions,
    showTableOptionsModal,
    changeTableOptionsModalPart,
    tableOptionsModalPart,
    showTableAvailabilityMsg,
    listOfAllTables,
    updateListOfAllTables,
    sendData,
  }: any = useAppContext();

  const closeOptionsModal = () => {
    showTableOptionsModal();
    changeTableOptionsModalPart(0);
  };

  const previousModalPart = () => {
    const previous = tableOptionsModalPart - 1;
    changeTableOptionsModalPart(previous);
  };

  useEffect(() => {}, [tableOptionsModalPart]);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  const bookTheTable = (currentPart: number) => {
    changeTableOptionsModalPart(currentPart);
  };

  const cancelTableReservation = (currentPart: number) => {
    changeTableOptionsModalPart(currentPart);
  };

  const lockUnlockATable = (currentPart: number) => {
    changeTableOptionsModalPart(currentPart);
    const updateTablesAndAddLockedOnes = listOfAllTables.map(
      (tableGroups: any) => {
        return tableGroups.tables.map((item: any) => {
          if (item.id === table.id) {
            item.available = !table.available;
            return item;
          } else {
            return item;
          }
        });
      }
    );
    updateListOfAllTables(listOfAllTables);
    sendData();
    showTableAvailabilityMsg(
      true,
      `Bordet har blitt l??st ${table.available === true ? 'opp' : ''}`
    );
  };

  return (
    <>
      <Modal
        open={tableOptions}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {/* @ts-ignore */}
        <Box sx={style}>
          <div
            className={`flex mb-4 ${
              tableOptionsModalPart !== 2 ? 'justify-between' : 'justify-center'
            }`}
          >
            {tableOptionsModalPart === 1 && (
              <>
                <Button
                  variant="outlined"
                  sx={{ minWidth: 20, padding: '8px', mb: 3 }}
                  onClick={() => previousModalPart()}
                >
                  <ArrowBackIcon fontSize="small" />
                </Button>
              </>
            )}
            {tableOptionsModalPart !== 2 ? (
              <h3 className="text-2xl">{`BORD ${table.id}`}</h3>
            ) : null}
            {tableOptionsModalPart === 2 ? (
              <div className="flex flex-col items-center">
                <Button variant="contained" sx={{ mt: 3 }}>
                  {tableOptionsModalPart === 2
                    ? `BORDET HAR BLITT L??ST ${
                        table.available === true ? 'OPP' : ''
                      }`
                    : ''}
                </Button>

                <Button
                  variant="contained"
                  size="medium"
                  sx={{ minWidth: 20, mt: 3, mb: 3 }}
                  onClick={() => closeOptionsModal()}
                >
                  OK
                </Button>
              </div>
            ) : null}

            {tableOptionsModalPart !== 2 ? (
              <Button
                variant="outlined"
                size="small"
                sx={{ minWidth: 20, mb: 3 }}
                onClick={() => closeOptionsModal()}
              >
                <CloseIcon fontSize="small" />
              </Button>
            ) : null}
          </div>

          {tableOptionsModalPart === 0 && (
            <div className="flex flex-col">
              <Button
                variant="contained"
                size="large"
                sx={{ mb: 3 }}
                onClick={() => bookTheTable(1)}
              >
                BESTILL TIME
              </Button>
              <Button
                variant="contained"
                size="large"
                sx={{ mb: 3 }}
                onClick={() => cancelTableReservation(3)}
              >
                ALLE BESTILLINGER P?? BORDET
              </Button>
              <Button
                variant="contained"
                size="large"
                sx={{ mb: 3 }}
                onClick={() => lockUnlockATable(2)}
              >
                {`${
                  table.available === true ? 'L??SE BORDET' : 'L??SE OPP BORDET'
                }`}
              </Button>
            </div>
          )}
          <>
            {tableOptionsModalPart === 1 && (
              <>
                <BookTableManually table={table} size={size} />
              </>
            )}
          </>
          <>
            {tableOptionsModalPart === 3 && (
              <>
                <SingleTableFindReservationsModal
                  table={table}
                  previousPart={previousModalPart}
                />
              </>
            )}
          </>
        </Box>
      </Modal>
    </>
  );
};
export default TableOptionsModal;
