import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpRight } from 'lucide-react';

const DonateSection = ({ address, selectedDonation, navigateToProfilePage }) => {
  const [txData, setTxData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(
          `https://api-sepolia.arbiscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=M3N4ZZECXVAZYWTQX1D7DDMVAYZF4BM9AF`
        );
        const data = await response.json();
        
        if (data.status === "1" && data.result) {
          const transformedData = data.result
            .filter(tx => {
              const method = tx.functionName.toLowerCase();
              return method.includes('donate') || method.includes('contribution');
            })
            .slice(0, 10) // Get only the latest 10 transactions
            .map(tx => ({
              TransactionHash: tx.hash,
              Method: tx.functionName.split('(')[0] || 'Transfer',
              Block: tx.blockNumber,
              Age: Math.floor((Date.now() / 1000 - tx.timeStamp) / 3600) + 'h ago',
              From: tx.from,
              to: tx.to,
              amount: (tx.value / 1e18).toFixed(4)
            }));
          setTxData(transformedData);
        } else {
          setError('No transactions found or API error');
        }
      } catch (err) {
        setError('Failed to fetch transaction data');
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      fetchTransactions();
    }
  }, [address]);

  if (loading) return <div>Loading transactions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="overflow-x-auto max-w-[612px] mt-4 rounded-t-lg">
      <a 
        href={`https://sepolia.arbiscan.io/address/${address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-[#5794D1] hover:text-[#5794D1]/80 mb-4"
      >
        View on Arbiscan <ArrowUpRight className="w-4 h-4" />
      </a>
      
      <Table className="rounded-lg">
        <TableHeader className="bg-white/10 ">
          <TableRow className="border-white/5 p-2 rounded-lg">
            <TableHead className="font-bold border-white/1 text-white truncate max-w-[10px]">Transaction Hash</TableHead>
            <TableHead className="font-bold border-white/1 text-white">Method</TableHead>
            <TableHead className="font-bold border-white/1 text-white">Block</TableHead>
            <TableHead className="font-bold border-white/1 text-white">Age</TableHead>
            <TableHead className="font-bold border-white/1 text-white">From</TableHead>
            <TableHead className="font-bold border-white/1 text-white">To</TableHead>
            <TableHead className="font-bold border-white/1 text-white">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {txData.map((item, index) => (
            <TableRow key={index} className="bg-white/5 border-white/5">
              <TableCell className="font-medium text-white whitespace-nowrap">
                {item.TransactionHash}
              </TableCell>
              <TableCell className="font-medium text-white whitespace-nowrap">
                {item.Method}
              </TableCell>
              <TableCell className="font-medium text-white whitespace-nowrap">
                {item.Block}
              </TableCell>
              <TableCell className="font-medium text-white whitespace-nowrap">
                {item.Age}
              </TableCell>
              <TableCell className="font-medium text-white whitespace-nowrap">
                {item.From}
              </TableCell>
              <TableCell className="font-medium text-white whitespace-nowrap">
                {item.to}
              </TableCell>
              <TableCell className="font-medium text-white whitespace-nowrap">
                {item.amount}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DonateSection;