import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../context/AppContext';

const FormFinish = () => {
  let router = useRouter();

  const { changeCurrentFormPartVisible, axiosFetch }: any = useAppContext();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/');
      changeCurrentFormPartVisible(0);
      axiosFetch();
    }, 4000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="form-finish">
      <h1 className="text-2xl font-semibold uppercase tracking-widest">
        Bord har blitt booket. Takk!
      </h1>
    </div>
  );
};

export default FormFinish;
