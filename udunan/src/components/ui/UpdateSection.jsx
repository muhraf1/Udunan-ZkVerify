import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpRight, Dot } from 'lucide-react';

const GET_WITHDRAWALS = gql`
  query GetWithdrawals($take: Int, $skip: Int) {
    withdrawals(take: $take, skip: $skip) {
      id
      tx_hash
      amount
      title
      description
      fromAddress
      toAddress
      createdAt
    }
  }
`;

const UpdateSection = ({ address, updateData, getTimeDifference }) => {
  const { data, loading, error } = useQuery(GET_WITHDRAWALS, {
    variables: { take: 10, skip: 0 },
  });

  const [txData, setTxData] = React.useState([]);
  const [txLoading, setTxLoading] = React.useState(true);
  const [txError, setTxError] = React.useState(null);

  React.useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(
          `https://api-sepolia.arbiscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=M3N4ZZECXVAZYWTQX1D7DDMVAYZF4BM9AF`
        );
        const data = await response.json();
        console.log('Raw API Response:', data);
        
        if (data.status === "1" && data.result) {
          const transformedData = data.result
            .filter(tx => {
              const method = tx.functionName.toLowerCase();
              return method.includes('withdraw');
            })
            .slice(0, 10)
            .map(tx => ({
              TransactionHash: tx.hash,
              Method: tx.functionName.split('(')[0] || 'Transfer',
              Block: tx.blockNumber,
              Age: Math.floor((Date.now() / 1000 - tx.timeStamp) / 3600) + 'h ago',
              From: tx.from,
              to: tx.to,
              amount: (tx.value / 1e18).toFixed(4)
            }));
          console.log('Transformed Transaction Data:', transformedData);
          setTxData(transformedData);
        } else {
          setTxError('No transactions found or API error');
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setTxError('Failed to fetch transaction data');
      } finally {
        setTxLoading(false);
      }
    };

    if (address) {
      fetchTransactions();
    }
  }, [address]);

  if (loading || txLoading) return <div>Loading updates...</div>;
  if (error || txError) return <div>Error loading updates</div>;

  return (
    <div className="w-full">
      {/* Withdrawal Updates */}
      {/* <div className="w-full mt-4 space-y-4">
        {updateData.map((updates, index) => (
          <div key={`${updates.id}-${index}`} className="flex flex-col gap-4 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white">{updates.amount}</span>
              <span className="font-bold text-sm">{updates.title}</span>
              <Dot className="w-4 h-4" />
              <span className="font-light text-sm">
                {getTimeDifference(updates.createdAt)}
              </span>
            </div>
            <div className="flex-1 flex flex-col bg-white/5 p-4 rounded-lg border border-[#5C7683]/20">
              <p className="font-semibold text-xs">{updates.description}</p>
            </div>
          </div>
        ))}
      </div> */}

      {/* Block Explorer Section */}
      <div className="overflow-x-auto max-w-[612px] mt-4 rounded-t-lg">
        <a 
          href={`https://sepolia.arbiscan.io/address/${address}#internaltx`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[#5794D1] hover:text-[#5794D1]/80 mb-4"
        >
          View on Arbiscan <ArrowUpRight className="w-4 h-4" />
        </a>
        
        <Table className="rounded-lg">
          <TableHeader className="bg-white/10">
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
    </div>
  );
};

export default UpdateSection;