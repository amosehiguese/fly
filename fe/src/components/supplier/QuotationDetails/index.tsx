import {
  CompanyRelocationQuotation,
  HeavyLiftingQuotation,
  MovingCleaningQuotation,
  Quotation,
  ResidentialMoveQuotation,
} from "@/api/interfaces/admin/quotations";
import HeavyLiftingDetails from "./HeavyLifting";
import ResidentialMoveDetails from "./ResidentialMove";
import MovingCleaningDetails from "./MovingCleaning";
import CompanyRelocationDetails from "./CompanyRelocation";

export const QuotationDetails = ({ quotation }: { quotation: Quotation }) => {
  switch (quotation.service_type) {
    case "Heavy Lifting":
      return (
        <HeavyLiftingDetails quotation={quotation as HeavyLiftingQuotation} />
      );
    case "Privacy Move":
    case "Private Move":
      return (
        <ResidentialMoveDetails
          quotation={quotation as ResidentialMoveQuotation}
          type="privateMove"
        />
      );
    case "Evacuation Move":
      return (
        <ResidentialMoveDetails
          quotation={quotation as ResidentialMoveQuotation}
          type="evacuationMove"
        />
      );
    case "Estate Clearance":
      return (
        <ResidentialMoveDetails
          quotation={quotation as ResidentialMoveQuotation}
          type="estateClearance"
        />
      );
    case "Secrecy Move":
      return (
        <ResidentialMoveDetails
          quotation={quotation as ResidentialMoveQuotation}
          type="secrecyMove"
        />
      );
    case "Residential Move":
      return (
        <ResidentialMoveDetails
          quotation={quotation as ResidentialMoveQuotation}
          type="privateMove"
        />
      );
    case "Moving & Cleaning":
      return (
        <MovingCleaningDetails
          quotation={quotation as MovingCleaningQuotation}
        />
      );
    case "Company Relocation":
      return (
        <CompanyRelocationDetails
          quotation={quotation as CompanyRelocationQuotation}
        />
      );
    // Add other cases...
    default:
      return <div>Unknown quotation type</div>;
  }
};
