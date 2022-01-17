import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Modal from '@mui/material/Modal';
import { useAppContext } from '../context/AppContext';
import BookTableManually from './BookTableManually';

// type msgTypes = { show?: boolean; msg?: string };

const TableOptionsModal = ({ table, size }) => {
  const {
    tableOptions,
    showTableOptionsModal,
    changeTableOptionsModalPart,
    tableOptionsModalPart,
  } = useAppContext();

  const closeOptionsModal = () => {
    showTableOptionsModal();
    changeTableOptionsModalPart(0);
  };

  const previousModalPart = () => {
    const previous = tableOptionsModalPart - 1;
    changeTableOptionsModalPart(previous);
  };

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

  const bookTheTable = (currentPart) => {
    changeTableOptionsModalPart(currentPart);
  };

  return (
    <>
      <Modal
        open={tableOptions}
        // onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div
            className={`flex mb-8 ${
              tableOptionsModalPart > 0 ? 'justify-between' : 'justify-end'
            }`}
          >
            {tableOptionsModalPart === 1 && (
              <>
                <Button
                  variant="outlined"
                  sx={{ mb: 3 }}
                  onClick={() => previousModalPart()}
                >
                  <ArrowBackIcon />
                </Button>
              </>
            )}

            <Button
              variant="outlined"
              sx={{ mb: 3 }}
              onClick={() => closeOptionsModal()}
            >
              <CloseIcon />
            </Button>
          </div>
          {tableOptionsModalPart === 0 && (
            <div className="flex flex-col">
              <Button
                variant="contained"
                sx={{ mb: 3 }}
                onClick={() => bookTheTable(1)}
              >
                Book the table
              </Button>
              <Button variant="contained" sx={{ mb: 3 }}>
                Cancel reservation
              </Button>
              <Button variant="contained" sx={{ mb: 3 }}>
                Lock the table
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
        </Box>
      </Modal>
    </>
  );
};
export default TableOptionsModal;
