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
import { format, areIntervalsOverlapping, addDays, addHours } from 'date-fns';

const BookTableManually = ({ table, size }: any) => {
  const {
    manuallyBookATable,
    setDate,
    dataFromDb,
    showTableAvailabilityMsg,
  }: any = useAppContext();

  const [currentDate, setCurrentDate] = useState<any>(new Date());
  const [timeStartEndUserInput, setTimeStartEndUserInput] = useState<any>({});

  const [arrivingTime, setArrivingTime] = useState<any>(new Date());
  const [leavingTime, setLeavingTime] = useState<any>(new Date());

  const [arrivingTimeAsString, setArrivingTimeAsString] = useState<string>('');
  const [leavingTimeAsString, setLeavingTimeAsString] = useState<string>('');

  const [isName, setIsName] = useState<string>('');
  const [isEmail, setIsEmail] = useState<string>('');

  const [minLeaveTimeForTimePicker, setMinLeaveTimeForTimePicker] =
    useState<number>(0);

  //   set maximum date in future for booking
  const [twoWeeksInFuture, setTwoWeeksInFuture] = useState<any>(
    addDays(new Date(), 13)
  );

  useEffect(() => {
    //   set default values/dates for arrivalTime and leavingTime only on first render
    const day = currentDate.getDate();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    setArrivingTime(new Date(year, month, day, 12, 0));
    setLeavingTime(new Date(year, month, day, 13, 0));
  }, []);

  useEffect(() => {
    if (currentDate) {
      const dateFormatDbReady = currentDate.toString().slice(0, 15);
      setDate(dateFormatDbReady);
    }
  }, [currentDate]);

  useEffect(() => {
    if (arrivingTime && leavingTime) {
      const day = currentDate.getDate();
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();
      const hourArrive = arrivingTime.getHours();
      const minutesArrive = arrivingTime.getMinutes();
      const hourLeave = leavingTime.getHours();
      const minutesLeave = leavingTime.getMinutes();

      const arrive = new Date(year, month, day, hourArrive, minutesArrive, 0);
      const leave = new Date(year, month, day, hourLeave, minutesLeave, 0);

      setMinLeaveTimeForTimePicker(
        //@ts-ignore
        new Date(year, month, day, hourArrive, minutesArrive + 30, 0)
      );

      setTimeStartEndUserInput({
        start: arrive,
        end: leave,
      });
      setArrivingTimeAsString(format(arrivingTime, 'H:mm'));
      setLeavingTimeAsString(format(leavingTime, 'H:mm'));
    }
  }, [currentDate, arrivingTime, leavingTime]);

  const submitAndBookTheTable = (e) => {
    e.preventDefault();

    if (isName.length < 2) {
      showTableAvailabilityMsg(true, `SJEKK NAVNET`);
      return;
    }

    const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!isEmail.match(mailFormat) || isEmail.length < 4) {
      showTableAvailabilityMsg(true, `SJEKK EMAIL`);
      return;
    }

    if (arrivingTime.getHours() >= 21 && arrivingTime.getMinutes() >= 15) {
      showTableAvailabilityMsg(true, `Et bord kan bookes senest klokka 21.15h`);
      return;
    }

    if (arrivingTime.getHours() >= 0 && arrivingTime.getHours() < 12) {
      showTableAvailabilityMsg(true, `Et bord kan ikke bookes før klokka 12h`);
      return;
    }

    if (leavingTime.getHours() >= 22 && leavingTime.getMinutes() >= 1) {
      showTableAvailabilityMsg(true, `Senest avreisetid er klokka 22h`);
      return;
    }

    if (table.reservedTimes?.length > 0) {
      console.log('book manually usao kad postoji rezervacija');

      const timeAlreadyUsed = table.reservedTimes.some((time: any) => {
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
        const areTimesOverlapping = table.reservedTimes.find((time: any) => {
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
              {
                tableNumber: table.id,
                name: isName.toLowerCase(),
                email: isEmail,
                time: timeStartEndUserInput,
              },
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
      const updatedTable = {
        ...table,
        reservedTimes: [timeStartEndUserInput],
        customers: [
          {
            tableNumber: table.id,
            name: isName.toLowerCase(),
            email: isEmail,
            time: timeStartEndUserInput,
          },
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
              maxDate={twoWeeksInFuture}
              inputFormat="dd/MM/yyyy"
              disablePast
              value={currentDate}
              onChange={(date) => {
                setCurrentDate(date);
              }}
              renderInput={(props) => <TextField {...props} />}
            />

            <MobileTimePicker
              label="Velg ankomsttid"
              minTime={new Date(0, 0, 0, 12)}
              maxTime={new Date(0, 0, 0, 21, 0)}
              //@ts-ignore

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
              label="Velg avreisetid"
              minTime={minLeaveTimeForTimePicker}
              maxTime={new Date(0, 0, 0, 22, 0)}
              //@ts-ignore

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
                <form className="person__form ">
                  <div className="person__form__fields flex flex-col items-center">
                    <TextField
                      sx={{ mb: 3 }}
                      type="text"
                      id="outlined-basic"
                      label="Navn"
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
                      BESTILL
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
