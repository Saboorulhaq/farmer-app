import TransactionHome from '@/screens/farmer/transactions/TransactionHome';
import TransactionsScreen from '@/screens/farmer/transactions/TransactionsScreen';
import ActiveRequestsSeeAll from '@/screens/farmer/transactions/ActiveRequestsSeeAll';
import ActiveFinanceDetail from '@/screens/farmer/transactions/ActiveFinanceDetail';
import LoansSeeAll from '@/screens/farmer/transactions/LoansSeeAll';
import ActiveLoanDetail from '@/screens/farmer/transactions/ActiveLoanDetail';
import LoanStatusScreen from '@/screens/farmer/loan-status/LoanStatusScreen';
import LoanSummaryScreen from '@/screens/farmer/loan-summary/LoanSummaryScreen';
import ViewOffersScreen from '@/screens/farmer/view-offers/ViewOffersScreen';
import OfferDetailScreen from '@/screens/farmer/offer-detail/OfferDetailScreen';
import BuyOrdersSeeAll from '@/screens/farmer/transactions/marketplace/BuyOrdersSeeAll';
import SaleOrdersSeeAll from '@/screens/farmer/transactions/marketplace/SaleOrdersSeeAll';
import BuyOrderDetail from '@/screens/farmer/transactions/marketplace/BuyOrderDetail';
import SaleOrderDetail from '@/screens/farmer/transactions/marketplace/SaleOrderDetail';
import ShippingStatus from '@/screens/farmer/transactions/marketplace/ShippingStatus';
import BankApplication from '@/components/screens/farmer/bank-credit/BankApplication';
import DynamicLoanApplication from '@/components/screens/farmer/bank-credit/DynamicLoanApplication';
import LoanRequest from '@/components/screens/farmer/bank-credit/LoanRequest';
import PersonalDetails from '@/components/screens/farmer/bank-credit/PersonalDetails';
import FarmDetails from '@/components/screens/farmer/bank-credit/FarmDetails';
import FinancialProfile from '@/components/screens/farmer/bank-credit/FinancialProfile';
import Documents from '@/components/screens/farmer/bank-credit/Documents';
import SaleAgreementPreview from '@/components/screens/farmer/bank-credit/SaleAgreementPreview';
import LoanRequestOTPVerification from '@/components/screens/farmer/bank-credit/LoanRequestOTPVerification';
import LoanApplicationSuccess from '@/components/screens/farmer/bank-credit/LoanApplicationSuccess';
import GovernmentVerifiedBuyers from '@/components/screens/farmer/bank-credit/GovernmentVerifiedBuyers';
import VerifiedBuyerDetails from '@/components/screens/farmer/bank-credit/VerifiedBuyerDetails';
import SaleAgreement from '@/components/screens/farmer/bank-credit/SaleAgreement';
import Authentication from '@/components/screens/farmer/bank-credit/Authentication';
import BankSelection from '@/components/screens/farmer/bank-credit/BankSelection';
import { InputPurchaseScreen, CartSummaryScreen, CheckoutScreen } from '@/screens/provider';
import LogHarvestDetails from '@/components/screens/farmer/sell-harvest/LogHarvestDetails';
import SellHarvest from '@/components/screens/farmer/sell-harvest/SellHarvest';
import HarvestOfferSummary from '@/components/screens/farmer/sell-harvest/HarvestOfferSummary';
import FsaSalesOrder from '@/components/screens/farmer/sell-harvest/FsaSalesOrder';
import HarvestDetailsScreen from '@/screens/farmer/profile/HarvestDetailsScreen';
import AddFarmScreen from '@/screens/farmer/profile/AddFarmScreen';
import AuthFarmerCaptureLocationScreen from '@/screens/auth/farmer/capture-location/AuthFarmerCaptureLocationScreen';
import ComingSoonScreen from '@/screens/shared/coming-soon/ComingSoonScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const TransactionsStackNavigator = createNativeStackNavigator();

export function TransactionsStack() {
  return (
    <TransactionsStackNavigator.Navigator
      initialRouteName="TransactionsMain"
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <TransactionsStackNavigator.Screen
        name="TransactionsMain"
        component={TransactionHome}
      />
      <TransactionsStackNavigator.Screen
        name="LoanApplications"
        component={TransactionsScreen}
      />
      <TransactionsStackNavigator.Screen
        name="ActiveRequestsSeeAll"
        component={ActiveRequestsSeeAll}
      />
      <TransactionsStackNavigator.Screen
        name="ActiveFinanceDetail"
        component={ActiveFinanceDetail}
      />
      <TransactionsStackNavigator.Screen
        name="LoansSeeAll"
        component={LoansSeeAll}
      />
      <TransactionsStackNavigator.Screen
        name="ActiveLoanDetail"
        component={ActiveLoanDetail}
      />
      <TransactionsStackNavigator.Screen 
        name="LoanStatus" 
        component={LoanStatusScreen} 
      />
      <TransactionsStackNavigator.Screen 
        name="LoanSummary" 
        component={LoanSummaryScreen} 
      />
      <TransactionsStackNavigator.Screen
        name="BankSelection"
        component={BankSelection}
      />
      <TransactionsStackNavigator.Screen
        name="ViewOffers"
        component={ViewOffersScreen}
      />
      <TransactionsStackNavigator.Screen
        name="OfferDetail"
        component={OfferDetailScreen}
      />
      <TransactionsStackNavigator.Screen
        name="BuyOrdersSeeAll"
        component={BuyOrdersSeeAll}
      />
      <TransactionsStackNavigator.Screen
        name="SaleOrdersSeeAll"
        component={SaleOrdersSeeAll}
      />
      <TransactionsStackNavigator.Screen
        name="BuyOrderDetail"
        component={BuyOrderDetail}
      />
      <TransactionsStackNavigator.Screen
        name="SaleOrderDetail"
        component={SaleOrderDetail}
      />
      <TransactionsStackNavigator.Screen
        name="ShippingStatus"
        component={ShippingStatus}
      />
      <TransactionsStackNavigator.Screen
        name="BankApplication"
        component={BankApplication}
      />
      <TransactionsStackNavigator.Screen
        name="DynamicLoanApplication"
        component={DynamicLoanApplication}
      />
      <TransactionsStackNavigator.Screen
        name="LoanRequest"
        component={LoanRequest}
      />
      <TransactionsStackNavigator.Screen
        name="PersonalDetails"
        component={PersonalDetails}
      />
      <TransactionsStackNavigator.Screen
        name="FarmDetails"
        component={FarmDetails}
      />
      <TransactionsStackNavigator.Screen
        name="FinancialProfile"
        component={FinancialProfile}
      />
      <TransactionsStackNavigator.Screen
        name="Documents"
        component={Documents}
      />
      <TransactionsStackNavigator.Screen
        name="InputPurchase"
        component={InputPurchaseScreen}
      />
      <TransactionsStackNavigator.Screen
        name="CartSummary"
        component={CartSummaryScreen}
      />
      <TransactionsStackNavigator.Screen
        name="Checkout"
        component={CheckoutScreen}
      />
      <TransactionsStackNavigator.Screen
        name="SaleAgreementPreview"
        component={SaleAgreementPreview}
      />
      <TransactionsStackNavigator.Screen
        name="LoanRequestOTPVerification"
        component={LoanRequestOTPVerification}
      />
      <TransactionsStackNavigator.Screen
        name="LoanApplicationSuccess"
        component={LoanApplicationSuccess}
      />
      <TransactionsStackNavigator.Screen
        name="GovernmentVerifiedBuyers"
        component={GovernmentVerifiedBuyers}
      />
      <TransactionsStackNavigator.Screen
        name="VerifiedBuyerDetails"
        component={VerifiedBuyerDetails}
      />
      <TransactionsStackNavigator.Screen
        name="SaleAgreement"
        component={SaleAgreement}
      />
      <TransactionsStackNavigator.Screen
        name="Authentication"
        component={Authentication}
      />
      <TransactionsStackNavigator.Screen
        name="LogHarvestDetails"
        component={LogHarvestDetails}
      />
      <TransactionsStackNavigator.Screen
        name="SellHarvest"
        component={SellHarvest}
      />
      <TransactionsStackNavigator.Screen
        name="HarvestOfferSummary"
        component={HarvestOfferSummary}
      />
      <TransactionsStackNavigator.Screen
        name="FsaSalesOrder"
        component={FsaSalesOrder}
      />
      <TransactionsStackNavigator.Screen
        name="HarvestDetails"
        component={HarvestDetailsScreen}
      />
      <TransactionsStackNavigator.Screen
        name="AddFarm"
        component={AddFarmScreen}
        options={{
          presentation: 'transparentModal',
          animation: 'slide_from_bottom',
        }}
      />
      <TransactionsStackNavigator.Screen
        name="CaptureLocation"
        component={AuthFarmerCaptureLocationScreen}
        options={{
          presentation: 'transparentModal',
          animation: 'slide_from_bottom',
        }}
      />
      <TransactionsStackNavigator.Screen
        name="ComingSoon"
        component={ComingSoonScreen}
      />
    </TransactionsStackNavigator.Navigator>
  );
}
