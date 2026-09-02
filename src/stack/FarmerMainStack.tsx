import FarmerMainScreen from '@/screens/farmer/main/FarmerMainScreen';
import ProductScreen from '@/screens/farmer/product';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoanRequest from '@/components/screens/farmer/bank-credit/LoanRequest';
import BankApplication from '@/components/screens/farmer/bank-credit/BankApplication';
import DynamicLoanApplication from '@/components/screens/farmer/bank-credit/DynamicLoanApplication';
import PersonalDetails from '@/components/screens/farmer/bank-credit/PersonalDetails';
import FarmDetails from '@/components/screens/farmer/bank-credit/FarmDetails';
import FinancialProfile from '@/components/screens/farmer/bank-credit/FinancialProfile';
import Documents from '@/components/screens/farmer/bank-credit/Documents';
import LoanRequestOTPVerification from '@/components/screens/farmer/bank-credit/LoanRequestOTPVerification';
import LoanApplicationSuccess from '@/components/screens/farmer/bank-credit/LoanApplicationSuccess';
import GovernmentVerifiedBuyers from '@/components/screens/farmer/bank-credit/GovernmentVerifiedBuyers';
import VerifiedBuyerDetails from '@/components/screens/farmer/bank-credit/VerifiedBuyerDetails';
import SaleAgreement from '@/components/screens/farmer/bank-credit/SaleAgreement';
import SaleAgreementPreview from '@/components/screens/farmer/bank-credit/SaleAgreementPreview';
import Authentication from '@/components/screens/farmer/bank-credit/Authentication';
import BankSelection from '@/components/screens/farmer/bank-credit/BankSelection';
import LoanStatusScreen from '@/screens/farmer/loan-status/LoanStatusScreen';
import LoanSummaryScreen from '@/screens/farmer/loan-summary/LoanSummaryScreen';
import ViewOffersScreen from '@/screens/farmer/view-offers/ViewOffersScreen';
import OfferDetailScreen from '@/screens/farmer/offer-detail/OfferDetailScreen';
import { InputPurchaseScreen, CartSummaryScreen, CheckoutScreen } from '@/screens/provider';
import LogHarvestDetails from '@/components/screens/farmer/sell-harvest/LogHarvestDetails';
import SellHarvest from '@/components/screens/farmer/sell-harvest/SellHarvest';
import HarvestOfferSummary from '@/components/screens/farmer/sell-harvest/HarvestOfferSummary';
import FsaSalesOrder from '@/components/screens/farmer/sell-harvest/FsaSalesOrder';
import HarvestDetailsScreen from '@/screens/farmer/profile/HarvestDetailsScreen';
import AddFarmScreen from '@/screens/farmer/profile/AddFarmScreen';
import AuthFarmerCaptureLocationScreen from '@/screens/auth/farmer/capture-location/AuthFarmerCaptureLocationScreen';
import MaintenanceScreen from '@/screens/shared/maintenance/MaintenanceScreen';
import UpdateRequiredScreen from '@/screens/shared/update-required/UpdateRequiredScreen';
import ComingSoonScreen from '@/screens/shared/coming-soon/ComingSoonScreen';
import CreditProfileScreen from '@/screens/farmer/credit-profile/CreditProfileScreen';
import NotificationsScreen from '@/screens/shared/notifications/NotificationsScreen';
import SaleOrderDetail from '@/screens/farmer/transactions/marketplace/SaleOrderDetail';
import ShippingStatus from '@/screens/farmer/transactions/marketplace/ShippingStatus';

const FarmerStack = createNativeStackNavigator();
// const FarmerApplicationStack = createNativeStackNavigator();

// function FarmerApplicationFlowNavigator() {
//   return (
//     <AgentFarmerRegisterProvider>
//       <FarmerApplicationStack.Navigator screenOptions={{ headerShown: false }}>
//         <FarmerApplicationStack.Screen
//           name="FarmerApplyMain"
//           component={AgentRegisterFarmerScreen}
//         />
//       </FarmerApplicationStack.Navigator>
//     </AgentFarmerRegisterProvider>
//   );
// }

export function FarmerMainStack() {
  return (
    <FarmerStack.Navigator
      initialRouteName="Main"
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <FarmerStack.Screen name="Main" component={FarmerMainScreen} />
      <FarmerStack.Screen name="Product" component={ProductScreen} />
      <FarmerStack.Screen name="CashCredit" component={ProductScreen} />
      <FarmerStack.Screen name="BankCredit" component={ProductScreen} />
      <FarmerStack.Screen name="BankApplication" component={BankApplication} />
      <FarmerStack.Screen
        name="DynamicLoanApplication"
        component={DynamicLoanApplication}
      />
      <FarmerStack.Screen name="LoanRequest" component={LoanRequest} />
      <FarmerStack.Screen name="PersonalDetails" component={PersonalDetails} />
      <FarmerStack.Screen name="FarmDetails" component={FarmDetails} />
      <FarmerStack.Screen
        name="FinancialProfile"
        component={FinancialProfile}
      />
      <FarmerStack.Screen name="Documents" component={Documents} />
      <FarmerStack.Screen
        name="GovernmentVerifiedBuyers"
        component={GovernmentVerifiedBuyers}
      />
      <FarmerStack.Screen
        name="VerifiedBuyerDetails"
        component={VerifiedBuyerDetails}
      />
      <FarmerStack.Screen name="SaleAgreement" component={SaleAgreement} />
      <FarmerStack.Screen
        name="SaleAgreementPreview"
        component={SaleAgreementPreview}
      />
      <FarmerStack.Screen name="Authentication" component={Authentication} />
      <FarmerStack.Screen
        name="LoanRequestOTPVerification"
        component={LoanRequestOTPVerification}
      />
      <FarmerStack.Screen
        name="LoanApplicationSuccess"
        component={LoanApplicationSuccess}
      />
      <FarmerStack.Screen name="LoanStatus" component={LoanStatusScreen} />
      <FarmerStack.Screen name="LoanSummary" component={LoanSummaryScreen} />
      <FarmerStack.Screen name="BankSelection" component={BankSelection} />
      <FarmerStack.Screen name="ViewOffers" component={ViewOffersScreen} />
      <FarmerStack.Screen name="OfferDetail" component={OfferDetailScreen} />
      <FarmerStack.Screen name="InputPurchase" component={InputPurchaseScreen} />
      <FarmerStack.Screen name="CartSummary" component={CartSummaryScreen} />
      <FarmerStack.Screen name="Checkout" component={CheckoutScreen} />
      <FarmerStack.Screen name="LogHarvestDetails" component={LogHarvestDetails} />
      <FarmerStack.Screen name="SellHarvest" component={SellHarvest} />
      <FarmerStack.Screen name="HarvestOfferSummary" component={HarvestOfferSummary} />
      <FarmerStack.Screen name="FsaSalesOrder" component={FsaSalesOrder} />
      <FarmerStack.Screen name="HarvestDetails" component={HarvestDetailsScreen} />
      <FarmerStack.Screen
        name="AddFarm"
        component={AddFarmScreen}
        options={{
          presentation: 'transparentModal',
          animation: 'slide_from_bottom',
        }}
      />
      <FarmerStack.Screen
        name="CaptureLocation"
        component={AuthFarmerCaptureLocationScreen}
        options={{
          presentation: 'transparentModal',
          animation: 'slide_from_bottom',
        }}
      />
      <FarmerStack.Screen name="Maintenance" component={MaintenanceScreen} />
      <FarmerStack.Screen name="UpdateRequired" component={UpdateRequiredScreen} />
      <FarmerStack.Screen name="ComingSoon" component={ComingSoonScreen} />
      <FarmerStack.Screen name="CreditProfile" component={CreditProfileScreen} />
      <FarmerStack.Screen name="Notifications" component={NotificationsScreen} />
      <FarmerStack.Screen name="SaleOrderDetail" component={SaleOrderDetail} />
      <FarmerStack.Screen name="ShippingStatus" component={ShippingStatus} />
      {/* <FarmerStack.Screen
        name="FarmerApplication"
        component={FarmerApplicationFlowNavigator}
      /> */}
    </FarmerStack.Navigator>
  );
}
