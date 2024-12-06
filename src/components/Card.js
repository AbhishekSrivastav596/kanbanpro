import React from 'react';
import { Plus } from 'react-feather';

function Card({ content, status, onClickPlus }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'complete':
        return 'bg-green-300';
      case 'inprogress':
        return 'bg-yellow-300';
      case 'todo':
        return 'bg-red-300';
      default:
        return 'bg-white';
    }
  };

  const getHeading = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div
      className={`rounded-xl shadow-lg m-4 w-80 min-h-[450px] flex flex-col overflow-hidden transition-all transform hover:scale-105 hover:shadow-2xl ${getStatusColor(
        status
      )}`}
    >
      <div className="text-center bg-amber-100 p-3">
        <h2 className="text-lg font-bold text-gray-800">{getHeading(status)}</h2>
      </div>

      <div className="text-gray-700 p-4 flex-grow break-words">
        <p className="text-lg text-gray-800">{content}</p>
      </div>

      <div className="flex justify-center mt-auto mb-4">
        <button
          onClick={onClickPlus}
          className="flex justify-center items-center  p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <Plus size={20} color="white" />
        </button>
      </div>
    </div>
  );
}

export default Card;
