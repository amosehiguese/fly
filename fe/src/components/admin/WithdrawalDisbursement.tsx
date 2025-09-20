import React from "react";
import {
  Card,
  CardContent,
  //   CardDescription,
  //   CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WithdrawalDisbursementProps {
  icon: React.ReactNode;
  focused: boolean;
  description: string;
  // percentageIncrease: number;
  amount: number;
  onClick: () => void;
}

const WithdrawalDisbursement = ({
  icon,
  focused,
  description,
  // percentageIncrease,
  amount,
  onClick,
}: WithdrawalDisbursementProps) => {
  return (
    <button onClick={onClick}>
      {" "}
      <Card
        className={`${
          focused && "bg-black text-white dark:bg-gray-100 dark:text-black"
        }`}
      >
        <CardHeader>
          <CardTitle className="flex justify-between items-center mr-8">
            <div className="h-10 w-10 rounded-lg flex justify-center items-center bg-black">
              {icon}
            </div>
            {/* <div className={`border  p-2 rounded-[10px] border-[#252525]`}>
              +{percentageIncrease}%
            </div> */}
          </CardTitle>
          {/* <CardDescription>{description}</CardDescription> */}
        </CardHeader>
        <CardContent className="mt-4 space-y-4">
          <p className="text-[18px]">{description}</p>
          <p className="text-[26px] font-bold">{amount}</p>
        </CardContent>
        {/* <CardFooter>
        <p>Card</p>
      </CardFooter> */}
      </Card>
    </button>
  );
};

export default WithdrawalDisbursement;
