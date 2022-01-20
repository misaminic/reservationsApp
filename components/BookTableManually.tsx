import { useState, useEffect } from 'react';
import DateAdapter from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import MobileTimePicker from '@mui/lab/MobileTimePicker';
import DatePicker from '@mui/lab/DatePicker';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useAppContext } from '../context/AppContext';
import _ from 'lodash';
import MsgModal from '../components/MsgModal';

import { format, areIntervalsOverlapping, addHours } from 'date-fns';

const BookTableManually = ({ table, size }) => {
  const { manuallyBookATable, setDate, dataFromDb, showTableAvailabilityMsg } =
    useAppContext();

  const [arrivingTime, setArrivingTime] = useState('');

  const [arrivingTimeAsString, setArrivingTimeAsString] = useState('');
  const [leavingTimeAsString, setLeavingTimeAsString] = useState('');

  const [leavingTime, setLeavingTime] = useState('');

  const [timeStartEndUserInput, setTimeStartEndUserInput] = useState({});
  const [currentDate, setCurrentDate] = useState('');

  const [isName, setIsName] = useState('');
  const [isEmail, setIsEmail] = useState('');

  useEffect(() => {
    if (currentDate) {
      const dateFormatDbReady = currentDate.toString().slice(0, 15);
      setDate(dateFormatDbReady);
    }
    console.log(
      dataFromDb.data?.reservations,
      dateFormatDbReady,
      'PROMENA DATUMA'
    );
  }, [currentDate]);

  useEffect(() => {
    if (arrivingTime && leavingTime) {
      // const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // const arrival = zonedTimeToUtc(arrivingTime, timeZone);
      // const leaving = zonedTimeToUtc(leavingTime, timeZone);
      // console.log(arrivingTime.toISOString());
      setTimeStartEndUserInput({
        start: arrivingTime,
        end: leavingTime,
      });
      setArrivingTimeAsString(format(arrivingTime, 'H:mm'));
      setLeavingTimeAsString(format(leavingTime, 'H:mm'));
    }
  }, [arrivingTime, leavingTime]);

  const submitAndBookTheTable = (e) => {
    e.preventDefault();

    if (table.reservedTimes?.length > 0) {
      console.log('book manually usao kad postoji rezervacija');

      const timeAlreadyUsed = table.reservedTimes.some((time) => {
        const timeSlotReserved = _.isEqual(
          { start: new Date(time?.start), end: new Date(time?.end) },
          timeStartEndUserInput
        );
        return timeSlotReserved === true;
      });

      if (timeAlreadyUsed === true) {
        showTableAvailabilityMsg(
          true,
          `Valgt tidspunktet er ikke ledig, prøv gjerne et annet tidspunkt.`
        );
      }

      if (timeAlreadyUsed === false) {
        const areTimesOverlapping = table.reservedTimes.find((time) => {
          console.log(
            new Date(time?.start),
            new Date(time?.end),
            'iz baze',
            timeStartEndUserInput,
            'user vreme book manually'
          );
          const checkIfTimesOverlapping = areIntervalsOverlapping(
            { start: new Date(time?.start), end: new Date(time?.end) },
            timeStartEndUserInput,
            {
              inclusive: true,
            }
          );

          return checkIfTimesOverlapping === true;
        });
        console.log(areTimesOverlapping, 'da li preplicu');
        if (areTimesOverlapping) {
          showTableAvailabilityMsg(
            true,
            `Valgt tidspunktet er ikke ledig, prøv gjerne et annet tidspunkt.`
          );
        }

        if (!areTimesOverlapping) {
          const updatedTable = {
            ...table,
            reservedTimes: [...table.reservedTimes, timeStartEndUserInput],
            customers: [
              ...table.customers,
              { name: isName, email: isEmail, time: timeStartEndUserInput },
            ],
          };
          if (updatedTable) {
            manuallyBookATable(updatedTable, size);
            showTableAvailabilityMsg(
              true,
              `Bordet ble reservert fra ${arrivingTimeAsString} klokka til ${leavingTimeAsString}.`
            );
          }
        }
      }
    } else {
      //   console.log('book manually usao kad ne postoji nijedna rezervacija');
      const updatedTable = {
        ...table,
        reservedTimes: [timeStartEndUserInput],
        customers: [
          { name: isName, email: isEmail, time: timeStartEndUserInput },
        ],
      };
      if (updatedTable) {
        manuallyBookATable(updatedTable, size);
        showTableAvailabilityMsg(
          true,
          `Bordet ble reservert fra ${arrivingTimeAsString} klokka til ${leavingTimeAsString}.`
        );
      }
    }
  };

  return (
    <>
      <MsgModal />
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

            <MobileTimePicker
              label="Velg ankomst tid"
              minTime={new Date(0, 0, 0, 12)}
              maxTime={new Date(0, 0, 0, 21, 0)}
              disablePast
              ampm={false}
              minutesStep={15}
              value={arrivingTime}
              onChange={(time) => {
                setArrivingTime(time);
              }}
              renderInput={(props) => <TextField {...props} />}
            />

            <MobileTimePicker
              label="Velg avreise tid"
              minTime={new Date(0, 0, 0, 12)}
              maxTime={new Date(0, 0, 0, 21, 0)}
              disablePast
              ampm={false}
              minutesStep={15}
              value={leavingTime}
              onChange={(time) => {
                setLeavingTime(time);
              }}
              renderInput={(props) => <TextField {...props} />}
            />

            <section className="email-name-section">
              <article>
                {/* <h5>Reservation details</h5> */}
                <form className="person__form ">
                  <div className="person__form__fields flex flex-col items-center">
                    <TextField
                      sx={{ mb: 3 }}
                      type="text"
                      id="outlined-basic"
                      label="Name"
                      variant="outlined"
                      name="name"
                      className="person__name-input"
                      value={isName}
                      onChange={(e) => setIsName(e.target.value)}
                    />

                    <TextField
                      sx={{ mb: 3 }}
                      type="email"
                      id="outlined-basic"
                      label="Email"
                      variant="outlined"
                      name="email"
                      value={isEmail}
                      onChange={(e) => setIsEmail(e.target.value)}
                      className="person__email-input"
                    />
                    <Button
                      type="submit"
                      value="Submit"
                      variant="contained"
                      onClick={(e) => submitAndBookTheTable(e)}
                    >
                      SUBMIT
                    </Button>
                  </div>
                </form>
              </article>
            </section>
          </Stack>
        }
      </LocalizationProvider>
    </>
  );
};

export default BookTableManually;
