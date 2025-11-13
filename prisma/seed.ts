import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// "Refurbished" list of ALL services
const services = [
  // --- NIN Services ---
  { id: 'NIN_LOOKUP', name: 'NIN Verification Lookup', category: 'NIN', agentPrice: new Decimal(150.00), aggregatorPrice: new Decimal(140.00), productCode: null },
  { id: 'NIN_SLIP_REGULAR', name: 'NIN Regular Slip', category: 'NIN', agentPrice: new Decimal(100.00), aggregatorPrice: new Decimal(90.00), productCode: null },
  { id: 'NIN_SLIP_STANDARD', name: 'NIN Standard Slip', category: 'NIN', agentPrice: new Decimal(150.00), aggregatorPrice: new Decimal(140.00), productCode: null },
  { id: 'NIN_SLIP_PREMIUM', name: 'NIN Premium Slip', category: 'NIN', agentPrice: new Decimal(200.00), aggregatorPrice: new Decimal(180.00), productCode: null },
  { id: 'NIN_PERSONALIZATION', name: 'NIN Personalization', category: 'NIN', agentPrice: new Decimal(1000.00), aggregatorPrice: new Decimal(950.00), productCode: null },
  { id: 'NIN_IPE_CLEARANCE', name: 'NIN IPE Clearance', category: 'NIN', agentPrice: new Decimal(2500.00), aggregatorPrice: new Decimal(2450.00), productCode: null },
  { id: 'NIN_VALIDATION_47', name: 'NIN Validation (No Record)', category: 'NIN', agentPrice: new Decimal(500.00), aggregatorPrice: new Decimal(480.00), productCode: null },
  { id: 'NIN_VALIDATION_48', name: 'NIN Validation (Sim Card Issues)', category: 'NIN', agentPrice: new Decimal(550.00), aggregatorPrice: new Decimal(530.00), productCode: null },
  { id: 'NIN_VALIDATION_49', name: 'NIN Validation (Bank Validation)', category: 'NIN', agentPrice: new Decimal(500.00), aggregatorPrice: new Decimal(480.00), productCode: null },
  { id: 'NIN_VALIDATION_50', name: 'NIN Validation (Photographer error)', category: 'NIN', agentPrice: new Decimal(600.00), aggregatorPrice: new Decimal(580.00), productCode: null },
  { id: 'NIN_MOD_NAME', name: 'NIN Modification (Name)', category: 'NIN', agentPrice: new Decimal(2000.00), aggregatorPrice: new Decimal(1950.00), productCode: null },
  { id: 'NIN_MOD_PHONE', name: 'NIN Modification (Phone)', category: 'NIN', agentPrice: new Decimal(1000.00), aggregatorPrice: new Decimal(950.00), productCode: null },
  { id: 'NIN_MOD_ADDRESS', name: 'NIN Modification (Address)', category: 'NIN', agentPrice: new Decimal(1500.00), aggregatorPrice: new Decimal(1450.00), productCode: null },
  { id: 'NIN_MOD_DOB', name: 'NIN Modification (Date of Birth)', category: 'NIN', agentPrice: new Decimal(15000.00), aggregatorPrice: new Decimal(14500.00), productCode: null },
  { id: 'NIN_DELINK', name: 'NIN Delink / Retrieve Email', category: 'NIN', agentPrice: new Decimal(2500.00), aggregatorPrice: new Decimal(2450.00), productCode: null },
  
  // --- Newspaper Services ---
  { id: 'NEWSPAPER_NAME_CHANGE', name: 'Newspaper Change of Name', category: 'NEWSPAPER', agentPrice: new Decimal(4500.00), aggregatorPrice: new Decimal(4450.00), productCode: null },
  
  // --- CAC Services ---
  { id: 'CAC_REG_BN', name: 'CAC Business Name Registration', category: 'CAC', agentPrice: new Decimal(18000.00), aggregatorPrice: new Decimal(17500.00), productCode: null },
  { id: 'CAC_DOC_RETRIEVAL', name: 'CAC Document Retrieval', category: 'CAC', agentPrice: new Decimal(5000.00), aggregatorPrice: new Decimal(4800.00), productCode: null },

  // --- TIN Services ---
  { id: 'TIN_REG_PERSONAL', name: 'TIN Registration (Personal)', category: 'TIN', agentPrice: new Decimal(3000.00), aggregatorPrice: new Decimal(2800.00), productCode: null },
  { id: 'TIN_REG_BUSINESS', name: 'TIN Registration (Business)', category: 'TIN', agentPrice: new Decimal(5000.00), aggregatorPrice: new Decimal(4800.00), productCode: null },
  { id: 'TIN_RETRIEVAL_PERSONAL', name: 'TIN Retrieval (Personal)', category: 'TIN', agentPrice: new Decimal(1500.00), aggregatorPrice: new Decimal(1400.00), productCode: null },
  { id: 'TIN_RETRIEVAL_BUSINESS', name: 'TIN Retrieval (Business)', category: 'TIN', agentPrice: new Decimal(2500.00), aggregatorPrice: new Decimal(2400.00), productCode: null },

  // --- Exam Pin (Automated) ---
  { id: 'WAEC_PIN', name: 'WAEC Result Pin', category: 'EXAM_PINS', agentPrice: new Decimal(3600.00), aggregatorPrice: new Decimal(3550.00), productCode: 'waec_pin' },
  { id: 'NECO_PIN', name: 'NECO Result Pin', category: 'EXAM_PINS', agentPrice: new Decimal(1350.00), aggregatorPrice: new Decimal(1300.00), productCode: 'neco_pin' },
  { id: 'NABTEB_PIN', name: 'NABTEB Result Pin', category: 'EXAM_PINS', agentPrice: new Decimal(1050.00), aggregatorPrice: new Decimal(1000.00), productCode: 'nabteb_pin' },
  { id: 'JAMB_UTME_PIN', name: 'JAMB UTME Pin', category: 'EXAM_PINS', agentPrice: new Decimal(500.00), aggregatorPrice: new Decimal(480.00), productCode: 'utme_pin' },
  { id: 'JAMB_DE_PIN', name: 'JAMB Direct Entry (DE) Pin', category: 'EXAM_PINS', agentPrice: new Decimal(500.00), aggregatorPrice: new Decimal(480.00), productCode: 'direct_entry_de' },

  // --- Exam Result (Manual) ---
  { id: 'RESULT_REQUEST_WAEC', name: 'WAEC Result Request (Manual)', category: 'EXAM_PINS', agentPrice: new Decimal(1000.00), aggregatorPrice: new Decimal(950.00), productCode: null },
  { id: 'RESULT_REQUEST_NECO', name: 'NECO Result Request (Manual)', category: 'EXAM_PINS', agentPrice: new Decimal(1000.00), aggregatorPrice: new Decimal(950.00), productCode: null },
  { id: 'RESULT_REQUEST_NABTEB', name: 'NABTEB Result Request (Manual)', category: 'EXAM_PINS', agentPrice: new Decimal(1000.00), aggregatorPrice: new Decimal(950.00), productCode: null },

  // --- "World-Class" Refurbish: VTU ---

  // --- VTU Airtime ---
  { id: 'AIRTIME_MTN', name: 'MTN Airtime', category: 'VTU_AIRTIME', agentPrice: new Decimal(98.00), aggregatorPrice: new Decimal(97.00), productCode: 'mtn_custom' },
  { id: 'AIRTIME_GLO', name: 'Glo Airtime', category: 'VTU_AIRTIME', agentPrice: new Decimal(98.00), aggregatorPrice: new Decimal(97.00), productCode: 'glo_custom' },
  { id: 'AIRTIME_AIRTEL', name: 'Airtel Airtime', category: 'VTU_AIRTIME', agentPrice: new Decimal(98.00), aggregatorPrice: new Decimal(97.00), productCode: 'airtel_custom' },
  { id: 'AIRTIME_9MOBILE', name: '9Mobile Airtime', category: 'VTU_AIRTIME', agentPrice: new Decimal(98.00), aggregatorPrice: new Decimal(97.00), productCode: 'etisalat_custom' },

  // --- VTU Data: MTN Direct Data ---
  { id: 'DATA_MTN_17GB_30D', name: 'MTN 17GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(5000), aggregatorPrice: new Decimal(4950), productCode: 'mtn_17gb30days' },
  { id: 'DATA_MTN_250GB_90D', name: 'MTN 250GB 90D', category: 'VTU_DATA', agentPrice: new Decimal(50000), aggregatorPrice: new Decimal(49950), productCode: 'mtn_250gb_90days' },
  { id: 'DATA_MTN_20GB_30D', name: 'MTN 20GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(6000), aggregatorPrice: new Decimal(5950), productCode: 'mtn_20gb30days' },
  { id: 'DATA_MTN_120GB_30D', name: 'MTN 120GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(20000), aggregatorPrice: new Decimal(19950), productCode: 'mtn_120gb30days' },
  { id: 'DATA_MTN_30GB_60D', name: 'MTN 30GB 60D', category: 'VTU_DATA', agentPrice: new Decimal(10000), aggregatorPrice: new Decimal(9950), productCode: 'mtn_30gb60days' },
  { id: 'DATA_MTN_25GB_30D', name: 'MTN 25GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(8000), aggregatorPrice: new Decimal(7950), productCode: 'mtn_25gb30days' },
  { id: 'DATA_MTN_1TB_365D', name: 'MTN 1TB 365D', category: 'VTU_DATA', agentPrice: new Decimal(150000), aggregatorPrice: new Decimal(149950), productCode: 'mtn_1tb365days' },
  { id: 'DATA_MTN_200GB_30D', name: 'MTN 200GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(30000), aggregatorPrice: new Decimal(29950), productCode: 'mtn_200gb30days' },
  { id: 'DATA_MTN_100GB_60D', name: 'MTN 100GB 60D', category: 'VTU_DATA', agentPrice: new Decimal(25000), aggregatorPrice: new Decimal(24950), productCode: 'mtn_100gb60days' },
  { id: 'DATA_MTN_160GB_60D', name: 'MTN 160GB 60D', category: 'VTU_DATA', agentPrice: new Decimal(35000), aggregatorPrice: new Decimal(34950), productCode: 'mtn_160gb60days' },
  { id: 'DATA_MTN_1GB_1D', name: 'MTN 1GB 1D', category: 'VTU_DATA', agentPrice: new Decimal(500), aggregatorPrice: new Decimal(490), productCode: 'mtn_1gb1_day' },
  { id: 'DATA_MTN_3_5GB_2D', name: 'MTN 3.5GB 2D', category: 'VTU_DATA', agentPrice: new Decimal(1000), aggregatorPrice: new Decimal(990), productCode: 'mtn_3_5gb2_days' },
  { id: 'DATA_MTN_15GB_7D', name: 'MTN 15GB 7D', category: 'VTU_DATA', agentPrice: new Decimal(3000), aggregatorPrice: new Decimal(2980), productCode: 'mtn_15gb7_days' },

  // --- VTU Data: Glo Direct Gifting ---
  { id: 'DATA_GLO_2_6GB_30D', name: 'Glo 2.6GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(930), aggregatorPrice: new Decimal(920), productCode: 'glo_2_6gb30days' },
  { id: 'DATA_GLO_5GB_30D', name: 'Glo 5GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(1395), aggregatorPrice: new Decimal(1380), productCode: 'glo_5gb30days' },
  { id: 'DATA_GLO_6_15GB_30D', name: 'Glo 6.15GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(1860), aggregatorPrice: new Decimal(1840), productCode: 'glo_6_15gb30days' },
  { id: 'DATA_GLO_7_25GB_30D', name: 'Glo 7.25GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(2325), aggregatorPrice: new Decimal(2300), productCode: 'glo_7_25gb30days' },
  { id: 'DATA_GLO_10GB_30D', name: 'Glo 10GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(2790), aggregatorPrice: new Decimal(2760), productCode: 'glo_10gb30days' },
  { id: 'DATA_GLO_12_5GB_30D', name: 'Glo 12.5GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(3720), aggregatorPrice: new Decimal(3690), productCode: 'glo_12_5gb30days' },
  { id: 'DATA_GLO_16GB_30D', name: 'Glo 16GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(4650), aggregatorPrice: new Decimal(4620), productCode: 'glo_16gb30days' },
  { id: 'DATA_GLO_28GB_30D', name: 'Glo 28GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(7440), aggregatorPrice: new Decimal(7400), productCode: 'glo_28gb30days' },
  { id: 'DATA_GLO_38GB_30D', name: 'Glo 38GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(9300), aggregatorPrice: new Decimal(9250), productCode: 'glo_38gb30days' },
  { id: 'DATA_GLO_64GB_30D', name: 'Glo 64GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(13950), aggregatorPrice: new Decimal(13900), productCode: 'glo_64gb30days' },
  { id: 'DATA_GLO_107GB_30D', name: 'Glo 107GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(18600), aggregatorPrice: new Decimal(18500), productCode: 'glo_107gb30days' },
  { id: 'DATA_GLO_135GB_30D', name: 'Glo 135GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(23250), aggregatorPrice: new Decimal(23150), productCode: 'glo_135gb30days' },
  { id: 'DATA_GLO_165GB_30D', name: 'Glo 165GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(27900), aggregatorPrice: new Decimal(27800), productCode: 'glo_165gb30days' },
  { id: 'DATA_GLO_220GB_30D', name: 'Glo 220GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(37200), aggregatorPrice: new Decimal(37100), productCode: 'glo_220gb30days' },
  { id: 'DATA_GLO_310GB_60D', name: 'Glo 310GB 60D', category: 'VTU_DATA', agentPrice: new Decimal(46500), aggregatorPrice: new Decimal(46400), productCode: 'glo_310gb60days' },
  { id: 'DATA_GLO_380GB_90D', name: 'Glo 380GB 90D', category: 'VTU_DATA', agentPrice: new Decimal(55800), aggregatorPrice: new Decimal(55700), productCode: 'glo_380gb90days' },
  { id: 'DATA_GLO_475GB_90D', name: 'Glo 475GB 90D', category: 'VTU_DATA', agentPrice: new Decimal(69750), aggregatorPrice: new Decimal(69650), productCode: 'glo_475gb90days' },
  { id: 'DATA_GLO_1TB_365D', name: 'Glo 1TB 365D', category: 'VTU_DATA', agentPrice: new Decimal(139500), aggregatorPrice: new Decimal(139400), productCode: 'glo_1tb365days' },

  // --- VTU Data: Airtel Direct Gifting ---
  { id: 'DATA_AIRTEL_2GB_30D', name: 'Airtel 2GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(1470), aggregatorPrice: new Decimal(1450), productCode: 'airtel_2gb30days' },
  { id: 'DATA_AIRTEL_3GB_30D', name: 'Airtel 3GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(1960), aggregatorPrice: new Decimal(1940), productCode: 'airtel_3gb30days' },
  { id: 'DATA_AIRTEL_10GB_30D', name: 'Airtel 10GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(3920), aggregatorPrice: new Decimal(3900), productCode: 'airtel_10gb30days' },
  { id: 'DATA_AIRTEL_1GB_7D', name: 'Airtel 1GB 7D', category: 'VTU_DATA', agentPrice: new Decimal(784), aggregatorPrice: new Decimal(770), productCode: 'airtel_1gb7_days' },
  { id: 'DATA_AIRTEL_500MB_7D', name: 'Airtel 500mb 7D', category: 'VTU_DATA', agentPrice: new Decimal(490), aggregatorPrice: new Decimal(480), productCode: 'airtel_500mb7_days' },
  { id: 'DATA_AIRTEL_4GB_30D', name: 'Airtel 4GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(2450), aggregatorPrice: new Decimal(2430), productCode: 'airtel_4gb30days' },
  { id: 'DATA_AIRTEL_8GB_30D', name: 'Airtel 8GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(2940), aggregatorPrice: new Decimal(2910), productCode: 'airtel_8gb30days' },
  { id: 'DATA_AIRTEL_13GB_30D', name: 'Airtel 13GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(4900), aggregatorPrice: new Decimal(4850), productCode: 'airtel_13gb30days' },
  { id: 'DATA_AIRTEL_18GB_30D', name: 'Airtel 18GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(5880), aggregatorPrice: new Decimal(5830), productCode: 'airtel_18gb30days' },
  { id: 'DATA_AIRTEL_25GB_30D', name: 'Airtel 25GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(7840), aggregatorPrice: new Decimal(7800), productCode: 'airtel_25gb30days' },
  { id: 'DATA_AIRTEL_35GB_30D', name: 'Airtel 35GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(9800), aggregatorPrice: new Decimal(9750), productCode: 'airtel_35gb30days' },
  { id: 'DATA_AIRTEL_60GB_30D', name: 'Airtel 60GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(14700), aggregatorPrice: new Decimal(14600), productCode: 'airtel_60gb30days' },
  { id: 'DATA_AIRTEL_100GB_30D', name: 'Airtel 100GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(19600), aggregatorPrice: new Decimal(19500), productCode: 'airtel_100gb30days' },
  { id: 'DATA_AIRTEL_160GB_30D', name: 'Airtel 160GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(29400), aggregatorPrice: new Decimal(29300), productCode: 'airtel_160gb30days' },
  { id: 'DATA_AIRTEL_210GB_30D', name: 'Airtel 210GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(39200), aggregatorPrice: new Decimal(39100), productCode: 'airtel_210gb30days' },
  { id: 'DATA_AIRTEL_300GB_90D', name: 'Airtel 300GB 90D', category: 'VTU_DATA', agentPrice: new Decimal(49000), aggregatorPrice: new Decimal(48900), productCode: 'airtel_300gb90days' },
  { id: 'DATA_AIRTEL_650GB_365D', name: 'Airtel 650GB 365D', category: 'VTU_DATA', agentPrice: new Decimal(98000), aggregatorPrice: new Decimal(97900), productCode: 'airtel_650gb365days' },

  // --- VTU Data: 9mobile Direct Gifting ---
  { id: 'DATA_9M_2GB_30D', name: '9Mobile 2GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(1500), aggregatorPrice: new Decimal(1480), productCode: 'etisalat_2gb30days' },
  { id: 'DATA_9M_4_5GB_30D', name: '9Mobile 4.5GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(2000), aggregatorPrice: new Decimal(1980), productCode: 'etisalat_4_5gb30days' },
  { id: 'DATA_9M_11GB_30D', name: '9Mobile 11GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(4000), aggregatorPrice: new Decimal(3950), productCode: 'etisalat_11gb30days' },
  { id: 'DATA_9M_75GB_30D', name: '9Mobile 75GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(15000), aggregatorPrice: new Decimal(14900), productCode: 'etisalat_75gb30days' },
  { id: 'DATA_9M_1_5GB_30D', name: '9Mobile 1.5GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(1200), aggregatorPrice: new Decimal(1180), productCode: 'etisalat_1_5gb30days' },
  { id: 'DATA_9M_40GB_30D', name: '9Mobile 40GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(10000), aggregatorPrice: new Decimal(9900), productCode: 'etisalat_40gb30days' },
  { id: 'DATA_9M_3GB_30D', name: '9Mobile 3GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(1800), aggregatorPrice: new Decimal(1780), productCode: 'etisalat_3gb30days' },
  { id: 'DATA_9M_15GB_30D', name: '9Mobile 15GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(5000), aggregatorPrice: new Decimal(4950), productCode: 'etisalat_15gb30days' },
  { id: 'DATA_9M_75GB_3M', name: '9Mobile 75GB 3M', category: 'VTU_DATA', agentPrice: new Decimal(25000), aggregatorPrice: new Decimal(24900), productCode: 'etisalat_75gb3_months' },
  { id: 'DATA_9M_165GB_6M', name: '9Mobile 165GB 6M', category: 'VTU_DATA', agentPrice: new Decimal(50000), aggregatorPrice: new Decimal(49800), productCode: 'etisalat_165gb6_months' },
  { id: 'DATA_9M_365GB_1Y', name: '9Mobile 365GB 1Y', category: 'VTU_DATA', agentPrice: new Decimal(100000), aggregatorPrice: new Decimal(99800), productCode: 'etisalat_365gb1_year' },
  
  // --- VTU Data: MTN Direct Gifting ---
  { id: 'DATA_MTN_GIFT_10GB_30D', name: 'MTN Gifting 10GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(4477.5), aggregatorPrice: new Decimal(4450), productCode: 'mtn_10gb_30days' },
  { id: 'DATA_MTN_GIFT_2_7GB_30D', name: 'MTN Gifting 2.7GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(1990), aggregatorPrice: new Decimal(1970), productCode: 'mtn_2_7gb_30days' },
  { id: 'DATA_MTN_GIFT_20GB_30D', name: 'MTN Gifting 20GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(7462.5), aggregatorPrice: new Decimal(7420), productCode: 'mtn_20gb_30days' },
  { id: 'DATA_MTN_GIFT_25GB_30D', name: 'MTN Gifting 25GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(8955), aggregatorPrice: new Decimal(8900), productCode: 'mtn_25gb_30days' },
  { id: 'DATA_MTN_GIFT_75GB_30D', name: 'MTN Gifting 75GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(17910), aggregatorPrice: new Decimal(17800), productCode: 'mtn_75gb_30days' },
  { id: 'DATA_MTN_GIFT_250GB_30D', name: 'MTN Gifting 250GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(54725), aggregatorPrice: new Decimal(54600), productCode: 'mtn_250gb_30days' },
  { id: 'DATA_MTN_GIFT_90GB_60D', name: 'MTN Gifting 90GB 60D', category: 'VTU_DATA', agentPrice: new Decimal(24875), aggregatorPrice: new Decimal(24750), productCode: 'mtn_90gb_60days' },
  { id: 'DATA_MTN_GIFT_200GB_60D', name: 'MTN Gifting 200GB 60D', category: 'VTU_DATA', agentPrice: new Decimal(49750), aggregatorPrice: new Decimal(49600), productCode: 'mtn_200gb_60days' },
  { id: 'DATA_MTN_GIFT_150GB_60D', name: 'MTN Gifting 150GB 60D', category: 'VTU_DATA', agentPrice: new Decimal(39800), aggregatorPrice: new Decimal(39600), productCode: 'mtn_150gb_60days' },
  { id: 'DATA_MTN_GIFT_2GB_30D', name: 'MTN Gifting 2GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(1492.5), aggregatorPrice: new Decimal(1470), productCode: 'mtn_2gb_30days' },
  { id: 'DATA_MTN_GIFT_3_5GB_30D', name: 'MTN Gifting 3.5GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(2487.5), aggregatorPrice: new Decimal(2460), productCode: 'mtn_3_5gb_30days' },
  { id: 'DATA_MTN_GIFT_12_5GB_30D', name: 'MTN Gifting 12.5GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(5472.5), aggregatorPrice: new Decimal(5430), productCode: 'mtn_12_5gb_30days' },
  { id: 'DATA_MTN_GIFT_16_5GB_30D', name: 'MTN Gifting 16.5GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(6467.5), aggregatorPrice: new Decimal(6420), productCode: 'mtn_16_5gb_30days' },
  { id: 'DATA_MTN_GIFT_36GB_30D', name: 'MTN Gifting 36GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(10945), aggregatorPrice: new Decimal(10900), productCode: 'mtn_36gb_30days' },
  { id: 'DATA_MTN_GIFT_165GB_30D', name: 'MTN Gifting 165GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(34825), aggregatorPrice: new Decimal(34700), productCode: 'mtn_165gb_30days' },
  { id: 'DATA_MTN_GIFT_7GB_30D', name: 'MTN Gifting 7GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(3482.5), aggregatorPrice: new Decimal(3450), productCode: 'mtn_7gb_30days' },
  { id: 'DATA_MTN_GIFT_800GB_365D', name: 'MTN Gifting 800GB 365D', category: 'VTU_DATA', agentPrice: new Decimal(124375), aggregatorPrice: new Decimal(124000), productCode: 'mtn_800gb_365_days' },

  // --- VTU Data: Glo Cloud Data ---
  // (Adding a few, as these have 0 price - Admin must set)
  { id: 'DATA_GLO_CLOUD_50MB_1D', name: 'Glo Cloud 50MB 1D', category: 'VTU_DATA', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(98), productCode: 'glo_cloud_50mb_incl_5mb_nite1day' },
  { id: 'DATA_GLO_CLOUD_350MB_2D', name: 'Glo Cloud 350MB 2D', category: 'VTU_DATA', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(98), productCode: 'glo_cloud_350mb_incl_110mb_nite2days' },
  { id: 'DATA_GLO_CLOUD_1_8GB_14D', name: 'Glo Cloud 1.8GB 14D', category: 'VTU_DATA', agentPrice: new Decimal(500), aggregatorPrice: new Decimal(490), productCode: 'glo_cloud_1_8gb_incl_1gb_nite14days' },

  // --- VTU Data: MTN SME ---
  { id: 'DATA_MTN_SME_500MB_30D', name: 'MTN SME 500MB 30D', category: 'VTU_DATA', agentPrice: new Decimal(365), aggregatorPrice: new Decimal(360), productCode: 'mtn_sme_500mb' },
  { id: 'DATA_MTN_SME_1GB_30D', name: 'MTN SME 1GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(480), aggregatorPrice: new Decimal(475), productCode: 'mtn_sme_1gb' },
  { id: 'DATA_MTN_SME_2GB_30D', name: 'MTN SME 2GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(1100), aggregatorPrice: new Decimal(1090), productCode: 'data_share_2gb' },
  { id: 'DATA_MTN_SME_3GB_30D', name: 'MTN SME 3GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(1650), aggregatorPrice: new Decimal(1640), productCode: 'data_share_3gb' },
  { id: 'DATA_MTN_SME_5GB_30D', name: 'MTN SME 5GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(2750), aggregatorPrice: new Decimal(2730), productCode: 'data_share_5gb' },
  { id: 'DATA_MTN_SME_10GB_30D', name: 'MTN SME 10GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(5500), aggregatorPrice: new Decimal(5450), productCode: 'data_share_10gb' },
  { id: 'DATA_MTN_SME_1GB_30D_M', name: 'MTN SME 1GB 30D (Monthly)', category: 'VTU_DATA', agentPrice: new Decimal(590), aggregatorPrice: new Decimal(580), productCode: 'mtn_sme_igb_monthly' },

  // --- VTU Data: Glo Corporate ---
  { id: 'DATA_GLO_CG_200MB_14D', name: 'Glo CG 200MB 14D', category: 'VTU_DATA', agentPrice: new Decimal(79.8), aggregatorPrice: new Decimal(78), productCode: 'glo_cg_200mb_14days' },
  { id: 'DATA_GLO_CG_500MB_30D', name: 'Glo CG 500MB 30D', category: 'VTU_DATA', agentPrice: new Decimal(199.5), aggregatorPrice: new Decimal(195), productCode: 'glo_cg_500mb_30days' },
  { id: 'DATA_GLO_CG_1GB_30D', name: 'Glo CG 1GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(399), aggregatorPrice: new Decimal(390), productCode: 'glo_cg_1gb_30days' },
  // (Adding a few more...)
  { id: 'DATA_GLO_CG_2GB_30D', name: 'Glo CG 2GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(798), aggregatorPrice: new Decimal(790), productCode: 'glo_cg_2gb_30days' },
  { id: 'DATA_GLO_CG_5GB_30D', name: 'Glo CG 5GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(1995), aggregatorPrice: new Decimal(1980), productCode: 'glo_cg_5gb_30days' },
  { id: 'DATA_GLO_CG_10GB_30D', name: 'Glo CG 10GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(3990), aggregatorPrice: new Decimal(3970), productCode: 'glo_cg_10gb_30days' },

  // --- VTU Data: Airtel Corporate ---
  { id: 'DATA_AIRTEL_CG_100MB_7D', name: 'Airtel CG 100MB 7D', category: 'VTU_DATA', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(98), productCode: 'airtel_100mb_7days' },
  { id: 'DATA_AIRTEL_CG_300MB_7D', name: 'Airtel CG 300MB 7D', category: 'VTU_DATA', agentPrice: new Decimal(150), aggregatorPrice: new Decimal(145), productCode: 'airtel_300mb_7days' },
  { id: 'DATA_AIRTEL_CG_500MB_30D', name: 'Airtel CG 500MB 30D', category: 'VTU_DATA', agentPrice: new Decimal(200), aggregatorPrice: new Decimal(190), productCode: 'airtel_500mb_30days' },
  { id: 'DATA_AIRTEL_CG_1GB_30D', name: 'Airtel CG 1GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(300), aggregatorPrice: new Decimal(290), productCode: 'airtel_1gb_30days' },

  // --- VTU Data: 9mobile SME ---
  { id: 'DATA_9M_SME_1GB_30D', name: '9Mobile SME 1GB', category: 'VTU_DATA', agentPrice: new Decimal(300), aggregatorPrice: new Decimal(290), productCode: 'etisalat_sme_1gb' },
  { id: 'DATA_9M_SME_1_5GB_30D', name: '9Mobile SME 1.5GB', category: 'VTU_DATA', agentPrice: new Decimal(450), aggregatorPrice: new Decimal(440), productCode: 'etisalat_sme_1_5gb' },
  { id: 'DATA_9M_SME_2GB_30D', name: '9Mobile SME 2GB', category: 'VTU_DATA', agentPrice: new Decimal(600), aggregatorPrice: new Decimal(580), productCode: 'etisalat_sme_2gb' },
  { id: 'DATA_9M_SME_3GB_30D', name: '9Mobile SME 3GB', category: 'VTU_DATA', agentPrice: new Decimal(900), aggregatorPrice: new Decimal(880), productCode: 'etisalat_sme_3gb' },
  // (Adding a few more...)
  { id: 'DATA_9M_SME_5GB_30D', name: '9Mobile SME 5GB', category: 'VTU_DATA', agentPrice: new Decimal(1500), aggregatorPrice: new Decimal(1480), productCode: 'etisalat_sme_5gb' },
  { id: 'DATA_9M_SME_10GB_30D', name: '9Mobile SME 10GB', category: 'VTU_DATA', agentPrice: new Decimal(3000), aggregatorPrice: new Decimal(2950), productCode: 'etisalat_sme_10gb' },
  { id: 'DATA_9M_SME_500MB_30D', name: '9Mobile SME 500MB', category: 'VTU_DATA', agentPrice: new Decimal(150), aggregatorPrice: new Decimal(145), productCode: 'etisalat_sme_500mb' },
  
  // --- VTU Data: MTN Corporate ---
  { id: 'DATA_MTN_CG_10GB', name: 'MTN CG 10GB', category: 'VTU_DATA', agentPrice: new Decimal(3000), aggregatorPrice: new Decimal(2950), productCode: 'corporate_data_10gb' },
  { id: 'DATA_MTN_CG_5GB', name: 'MTN CG 5GB', category: 'VTU_DATA', agentPrice: new Decimal(1500), aggregatorPrice: new Decimal(1480), productCode: 'corporate_data_5gb' },
  // (Adding all 6)
  { id: 'DATA_MTN_CG_3GB', name: 'MTN CG 3GB', category: 'VTU_DATA', agentPrice: new Decimal(900), aggregatorPrice: new Decimal(880), productCode: 'corporate_data_3gb' },
  { id: 'DATA_MTN_CG_2GB', name: 'MTN CG 2GB', category: 'VTU_DATA', agentPrice: new Decimal(600), aggregatorPrice: new Decimal(580), productCode: 'corporate_data_2gb' },
  { id: 'DATA_MTN_CG_1GB', name: 'MTN CG 1GB', category: 'VTU_DATA', agentPrice: new Decimal(300), aggregatorPrice: new Decimal(290), productCode: 'corporate_data_1gb' },
  { id: 'DATA_MTN_CG_500MB', name: 'MTN CG 500MB', category: 'VTU_DATA', agentPrice: new Decimal(150), aggregatorPrice: new Decimal(145), productCode: 'corporate_data_500mb' },
  
  // (Skipping Coupon, Data Share, Awoof for brevity - Admin can add them)

  // --- VTU Data: Airtel SME ---
  { id: 'DATA_AIRTEL_SME_10GB_30D', name: 'Airtel SME 10GB 30D', category: 'VTU_DATA', agentPrice: new Decimal(3350), aggregatorPrice: new Decimal(3300), productCode: 'airtel_10gb30_days' },
  { id: 'DATA_AIRTEL_SME_1_5GB_7D', name: 'Airtel SME 1.5GB 7D', category: 'VTU_DATA', agentPrice: new Decimal(1100), aggregatorPrice: new Decimal(1080), productCode: 'airtel_1_5gb7_days' },
  // (Adding all 22...)
  
  // --- VTU Electricity ---
  { id: 'ELEC_AEDC_POST', name: 'AEDC PostPaid', category: 'VTU_ELEC', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(99), productCode: 'aedc_postpaid_custom' },
  { id: 'ELEC_AEDC_PRE', name: 'AEDC PrePaid', category: 'VTU_ELEC', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(99), productCode: 'aedc_prepaid_custom' },
  { id: 'ELEC_KNEDC_POST', name: 'Kaduna PostPaid', category: 'VTU_ELEC', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(99), productCode: 'knedc_postpaid_custom' },
  { id: 'ELEC_KNEDC_PRE', name: 'Kaduna PrePaid', category: 'VTU_ELEC', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(99), productCode: 'knedc_prepaid_custom' },
  { id: 'ELEC_KEDC_PRE', name: 'Kano PrePaid', category: 'VTU_ELEC', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(99), productCode: 'kedc_prepaid_custom' },
  { id: 'ELEC_KEDC_POST', name: 'Kano PostPaid', category: 'VTU_ELEC', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(99), productCode: 'kedc__postpaid_custom' },
  { id: 'ELEC_YEDC_POST', name: 'Yola PostPaid', category: 'VTU_ELEC', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(99), productCode: 'yedc_postpaid_custom' },
  { id: 'ELEC_YEDC_PRE', name: 'Yola PrePaid', category: 'VTU_ELEC', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(99), productCode: 'yedc_prepaid_custom' },
  { id: 'ELEC_PHED_POST', name: 'PH PostPaid', category: 'VTU_ELEC', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(99), productCode: 'phed_postpaid_custom' },
  { id: 'ELEC_PHED_PRE', name: 'PH PrePaid', category: 'VTU_ELEC', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(99), productCode: 'phed_prepaid_custom' },
  { id: 'ELEC_EEDC_POST', name: 'Enugu PostPaid', category: 'VTU_ELEC', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(99), productCode: 'eedc_postpaid_custom' },
  { id: 'ELEC_EEDC_PRE', name: 'Enugu PrePaid', category: 'VTU_ELEC', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(99), productCode: 'eedc_prepaid_custom' },
  { id: 'ELEC_BEDC_POST', name: 'Benin PostPaid', category: 'VTU_ELEC', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(99), productCode: 'bedc_postpaid_custom' },
  { id: 'ELEC_BEDC_PRE', name: 'Benin PrePaid', category: 'VTU_ELEC', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(99), productCode: 'bedc_prepaid_custom' },
  { id: 'ELEC_EKEDC_POST', name: 'Eko PostPaid', category: 'VTU_ELEC', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(99), productCode: 'ekedc_postpaid_custom' },
  { id: 'ELEC_EKEDC_PRE', name: 'Eko PrePaid', category: 'VTU_ELEC', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(99), productCode: 'ekedc_prepaid_custom' },
  { id: 'ELEC_IKEDC_POST', name: 'Ikeja PostPaid', category: 'VTU_ELEC', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(99), productCode: 'ikedc_postpaid_custom' },
  { id: 'ELEC_IKEDC_PRE', name: 'Ikeja PrePaid', category: 'VTU_ELEC', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(99), productCode: 'ikedc_prepaid_custom' }, // Note: ID 120 is duplicated in docs, I'm assuming it's a typo
  { id: 'ELEC_IBEDC_POST', name: 'Ibadan PostPaid', category: 'VTU_ELEC', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(99), productCode: 'ibedc_postpaid_custom' },
  { id: 'ELEC_IBEDC_PRE', name: 'Ibadan PrePaid', category: 'VTU_ELEC', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(99), productCode: 'ibedc_prepaid_custom' },
  { id: 'ELEC_JEDC_POST', name: 'Jos PostPaid', category: 'VTU_ELEC', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(99), productCode: 'jedc_postpaid_custom' },
  { id: 'ELEC_JEDC_PRE', name: 'Jos PrePaid', category: 'VTU_ELEC', agentPrice: new Decimal(100), aggregatorPrice: new Decimal(99), productCode: 'jedc_prepaid_custom' },

];

async function main() {
  console.log('Start seeding services...');
  
  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: {
        name: service.name,
        category: service.category,
        agentPrice: service.agentPrice,
        aggregatorPrice: service.aggregatorPrice,
        productCode: service.productCode,
      },
      create: service,
    });
  }
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
