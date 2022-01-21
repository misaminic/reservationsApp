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

  const [arrivingTime, setArrivingTime] = useState(new Date());

  const [arrivingTimeAsString, setArrivingTimeAsString] = useState('');
  const [leavingTimeAsString, setLeavingTimeAsString] = useState('');

  const [leavingTime, setLeavingTime] = useState(new Date());

  const [timeStartEndUserInput, setTimeStartEndUserInput] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());

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

      const day = currentDate.getDate();
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();
      const hourArrive = arrivingTime.getHours();
      const minutesArrive = arrivingTime.getMinutes();
      const hourLeave = leavingTime.getHours();
      const minutesLeave = leavingTime.getMinutes();

      const arrive = new Date(year, month, day, hourArrive, minutesArrive, 0);
      const leave = new Date(year, month, day, hourLeave, minutesLeave, 0);

      console.log(currentDate, 'datum iz Booked Manually');

      setTimeStartEndUserInput({
        start: arrive,
        end: leave,
      });
      setArrivingTimeAsString(format(arrivingTime, 'H:mm'));
      setLeavingTimeAsString(format(leavingTime, 'H:mm'));
    }
  }, [currentDate, arrivingTime, leavingTime]);

  useEffect(() => {
    // set minutes for arrivalTime and leavingTime to be 0, 15, 30 or 45
    const day = currentDate.getDate();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const hour = currentDate.getHours();
    const minutes = currentDate.getMinutes();

    // arrivingTime

    if (minutes > 0 && minutes < 15) {
      setArrivingTime(new Date(year, month, day, hour, 15));
    }

    if (minutes > 15 && minutes < 30) {
      setArrivingTime(new Date(year, month, day, hour, 30));
    }

    if (minutes > 30 && minutes < 45) {
      setArrivingTime(new Date(year, month, day, hour, 45));
    }

    if (minutes > 45) {
      setArrivingTime(new Date(year, month, day, hour, 0));
    }

    // currentLeavingTime

    if (minutes > 0 && minutes < 15) {
      setLeavingTime(new Date(year, month, day, hour + 1, 15));
    }

    if (minutes > 15 && minutes < 30) {
      setLeavingTime(new Date(year, month, day, hour + 1, 30));
    }

    if (minutes > 30 && minutes < 45) {
      setLeavingTime(new Date(year, month, day, hour + 1, 45));
    }

    if (minutes > 45) {
      setLeavingTime(new Date(year, month, day, hour + 1, 0));
    }
  }, []);

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
