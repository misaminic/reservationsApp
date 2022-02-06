import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useAppContext } from '../context/AppContext';

type msgTypes = { show?: boolean; msg?: string };

const MsgModal = () => {
  const {
    tableAvailabilityMsg: { show, msg },
    showTableAvailabilityMsg,
  }: any = useAppContext();

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '320px',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  return (
    <>
      <Modal
        open={show}
        // onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            variant="body1"
            component="h2"
            mb={3}
          >
            {msg}
          </Typography>
          <Button
            variant="contained"
            onClick={() => showTableAvailabilityMsg(false, '')}
          >
            OK
          </Button>
        </Box>
      </Modal>
    </>
  );
};
export default MsgModal;
