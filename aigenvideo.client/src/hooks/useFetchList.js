import axiosClient from '@/apis/axiosClient';
import { useEffect, useState } from 'react';

const useFetchList = (url, queryParams = {}, config = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const queryString = new URLSearchParams(queryParams).toString();
        const response = await axiosClient.get(`${url}?${queryString}`, config);
        if (!response.data.success) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = response.data.data;
        console.log(result);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url, JSON.stringify(queryParams), JSON.stringify(config)]);

  return { data, loading, error };
};

export default useFetchList;
