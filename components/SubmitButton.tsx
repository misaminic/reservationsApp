import React, { useState } from 'react';

const SubmitButton = ({ handler }: any) => {
  const [submitBtn, setSubmitBtn] = useState(false);

  const tickMark = (
    <svg
      width="35"
      height="25"
      viewBox="0 0 58 45"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: 'rotate(180deg)', transition: 'all .5s' }}
    >
      <path
        fill="#fff"
        fillRule="nonzero"
        d="M19.11 44.64L.27 25.81l5.66-5.66 13.18 13.18L52.07.38l5.65 5.65"
      />
    </svg>
  );

  return (
    <button
      type="submit"
      onClick={handler}
      className={`w-12 h-12 bg-green-500 transition-all button ${
        submitBtn === true ? 'button_circle' : null
      } `}
    >
      <div className="container">
        <div className="tick" onClick={() => setSubmitBtn(true)}>
          {submitBtn === false ? 'SUBMIT' : tickMark}
        </div>
      </div>
      <style jsx>{`
        .button {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 9rem;
          height: 3rem;
          margin-top: 2rem;
          letter-spacing: 0.1rem;
          background: #000;
          border: 1px solid #fff;
          border-radius: 0.25rem;
          transition: all 0.3s cubic-bezier(0.67, 0.17, 0.4, 0.83);
        }
        .button_circle {
          width: 3rem;
          height: 3rem;
          border-color: transparent;
          background-color: rgba(16, 185, 129, var(--tw-bg-opacity));
          border-radius: 50%;
          transform: rotate(-180deg);
        }
        .tick {
          display: flex;
          justify-content: center;
          color: white;
          font-size: 1rem;
          transition: all 0.9s;
        }
      `}</style>
    </button>
  );
};

export default SubmitButton;
