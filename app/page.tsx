"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, ArrowRightLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PoolState {
  tokenA: number;
  tokenB: number;
  lastSwapAmount: number;
  totalSwapVolume: number;
  swapCount: number;
}

interface SwapHistoryItem {
  amount: number;
  direction: 'AtoB' | 'BtoA';
  timestamp: string;
}

const initialPoolState: PoolState = {
  tokenA: 1000,
  tokenB: 1000,
  lastSwapAmount: 0,
  totalSwapVolume: 0,
  swapCount: 0,
};

const BalancerV3HookDemo: React.FC = () => {
  const [poolState, setPoolState] = useState<PoolState>(initialPoolState);
  const [swapAmount, setSwapAmount] = useState<string>('');
  const [swapDirection, setSwapDirection] = useState<'AtoB' | 'BtoA'>('AtoB');
  const [hookTriggered, setHookTriggered] = useState<boolean>(false);
  const [swapHistory, setSwapHistory] = useState<SwapHistoryItem[]>([]);

  const onAfterSwap = (amount: number, direction: 'AtoB' | 'BtoA'): void => {
    setPoolState(prevState => ({
      ...prevState,
      lastSwapAmount: amount,
      totalSwapVolume: prevState.totalSwapVolume + amount,
      swapCount: prevState.swapCount + 1
    }));
    setSwapHistory(prev => [...prev, { amount, direction, timestamp: new Date().toISOString() }]);
    setHookTriggered(true);
  };

  const executeSwap = (): void => {
    const amount = Number(swapAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid swap amount');
      return;
    }

    setPoolState(prevState => {
      const newState = { ...prevState };
      if (swapDirection === 'AtoB') {
        newState.tokenA -= amount;
        newState.tokenB += amount;
      } else {
        newState.tokenB -= amount;
        newState.tokenA += amount;
      }
      return newState;
    });

    onAfterSwap(amount, swapDirection);
  };

  useEffect(() => {
    if (hookTriggered) {
      const timer = setTimeout(() => setHookTriggered(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [hookTriggered]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">BalancerV3 onAfterSwap Hook Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Pool Liquidity</CardTitle>
            <CardDescription>Current balance of tokens in the pool</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <span>Token A</span>
              <span className="font-bold">{poolState.tokenA.toFixed(2)}</span>
            </div>
            <Progress value={(poolState.tokenA / (poolState.tokenA + poolState.tokenB)) * 100} className="mb-4" />
            <div className="flex justify-between items-center mb-2">
              <span>Token B</span>
              <span className="font-bold">{poolState.tokenB.toFixed(2)}</span>
            </div>
            <Progress value={(poolState.tokenB / (poolState.tokenA + poolState.tokenB)) * 100} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Swap Statistics</CardTitle>
            <CardDescription>Data updated by onAfterSwap hook</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Last Swap Amount:</span>
                <span className="font-bold">{poolState.lastSwapAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Swap Volume:</span>
                <span className="font-bold">{poolState.totalSwapVolume.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Swap Count:</span>
                <span className="font-bold">{poolState.swapCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Execute Swap</CardTitle>
          <CardDescription>Simulate a token swap to trigger the onAfterSwap hook</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Input 
              type="number" 
              value={swapAmount} 
              onChange={(e) => setSwapAmount(e.target.value)}
              placeholder="Swap amount"
            />
            <Select value={swapDirection} onValueChange={(value: 'AtoB' | 'BtoA') => setSwapDirection(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Swap direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AtoB">A to B</SelectItem>
                <SelectItem value="BtoA">B to A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={executeSwap} className="w-full">
            <ArrowRightLeft className="mr-2 h-4 w-4" /> Execute Swap
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="swapHistory" className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="swapHistory">Swap History</TabsTrigger>
          <TabsTrigger value="hookInfo">Hook Information</TabsTrigger>
        </TabsList>
        <TabsContent value="swapHistory">
          <Card>
            <CardHeader>
              <CardTitle>Recent Swaps</CardTitle>
              <CardDescription>Last 5 swaps executed in the pool</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {swapHistory.slice(-5).reverse().map((swap, index) => (
                  <li key={index} className="flex justify-between items-center border-b pb-2">
                    <span>{swap.amount} ({swap.direction})</span>
                    <span className="text-sm text-gray-500">{new Date(swap.timestamp).toLocaleTimeString()}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="hookInfo">
          <Card>
            <CardHeader>
              <CardTitle>onAfterSwap Hook</CardTitle>
              <CardDescription>Information about the hook's functionality</CardDescription>
            </CardHeader>
            <CardContent>
              <p>The onAfterSwap hook is triggered after each swap operation. It updates the following pool statistics:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Last swap amount</li>
                <li>Total swap volume</li>
                <li>Swap count</li>
              </ul>
              <p className="mt-2">This hook can be customized to implement more complex logic, such as dynamic fee adjustments or liquidity rebalancing.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {hookTriggered && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>onAfterSwap Hook Triggered</AlertTitle>
          <AlertDescription>
            The onAfterSwap hook has updated the pool statistics. Check the Swap Statistics card for the latest data.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default BalancerV3HookDemo;