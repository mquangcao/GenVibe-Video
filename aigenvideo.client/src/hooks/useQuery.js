import { useState } from 'react';

const useQuery = (initial) => {
  const [data, setData] = useState(initial);

  const updateData = (newData) => {
    setData((prevData) => ({ ...prevData, ...newData }));
  };

  const resetData = () => {
    setData(initial);
  };

  return [data, updateData, resetData];
};

export default useQuery;
