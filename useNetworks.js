import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getUserNetworks, getPublicNetworks } from './db';

export const useNetworks = () => {
  const { user } = useAuth();
  const [networks, setNetworks] = useState([]);
  const [publicNetworks, setPublicNetworks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNetworks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [my, pub] = await Promise.all([getUserNetworks(user.uid), getPublicNetworks()]);
      setNetworks(my);
      setPublicNetworks(pub.filter(n => !my.find(m => m.id === n.id)));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNetworks(); }, [user]);
  return { networks, publicNetworks, loading, refetch: fetchNetworks };
};
