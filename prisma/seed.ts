import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// "World-Class" helper for prices
const p = (platform: number, agent: number) => ({
  platformPrice: new Decimal(platform),
  defaultAgentPrice: new Decimal(agent),
});

// "Refurbished" list of ALL services with "world-class" pricing
const services = [
  // --- NIN Services ---
  { id: 'NIN_LOOKUP', name: 'NIN Verification Lookup', category: 'NIN', ...p(140.00, 150.00), productCode: null },
  { id: 'NIN_SLIP_REGULAR', name: 'NIN Regular Slip', category: 'NIN', ...p(90.00, 100.00), productCode: null },
  { id: 'NIN_SLIP_STANDARD', name: 'NIN Standard Slip', category: 'NIN', ...p(140.00, 150.00), productCode: null },
  { id: 'NIN_SLIP_PREMIUM', name: 'NIN Premium Slip', category: 'NIN', ...p(180.00, 200.00), productCode: null },
  { id: 'NIN_PERSONALIZATION', name: 'NIN Personalization', category: 'NIN', ...p(950.00, 1000.00), productCode: null },
  { id: 'NIN_IPE_CLEARANCE', name: 'NIN IPE Clearance', category: 'NIN', ...p(2450.00, 2500.00), productCode: null },
  { id: 'NIN_VALIDATION_47', name: 'NIN Validation (No Record)', category: 'NIN', ...p(480.00, 500.00), productCode: null },
  { id: 'NIN_VALIDATION_48', name: 'NIN Validation (Sim Card Issues)', category: 'NIN', ...p(530.00, 550.00), productCode: null },
  { id: 'NIN_VALIDATION_49', name: 'NIN Validation (Bank Validation)', category: 'NIN', ...p(480.00, 500.00), productCode: null },
  { id: 'NIN_VALIDATION_50', name: 'NIN Validation (Photographer error)', category: 'NIN', ...p(580.00, 600.00), productCode: null },
  { id: 'NIN_MOD_NAME', name: 'NIN Modification (Name)', category: 'NIN', ...p(1950.00, 2000.00), productCode: null },
  { id: 'NIN_MOD_PHONE', name: 'NIN Modification (Phone)', category: 'NIN', ...p(950.00, 1000.00), productCode: null },
  { id: 'NIN_MOD_ADDRESS', name: 'NIN Modification (Address)', category: 'NIN', ...p(1450.00, 1500.00), productCode: null },
  { id: 'NIN_MOD_DOB', name: 'NIN Modification (Date of Birth)', category: 'NIN', ...p(14500.00, 15000.00), productCode: null },
  { id: 'NIN_DELINK', name: 'NIN Delink / Retrieve Email', category: 'NIN', ...p(2450.00, 2500.00), productCode: null },
  
  // --- Newspaper Services ---
  { id: 'NEWSPAPER_NAME_CHANGE', name: 'Newspaper Change of Name', category: 'NEWSPAPER', ...p(4450.00, 4500.00), productCode: null },
  
  // --- CAC Services ---
  { id: 'CAC_REG_BN', name: 'CAC Business Name Registration', category: 'CAC', ...p(17500.00, 18000.00), productCode: null },
  { id: 'CAC_DOC_RETRIEVAL', name: 'CAC Document Retrieval', category: 'CAC', ...p(4800.00, 5000.00), productCode: null },

  // --- TIN Services ---
  { id: 'TIN_REG_PERSONAL', name: 'TIN Registration (Personal)', category: 'TIN', ...p(2800.00, 3000.00), productCode: null },
  { id: 'TIN_REG_BUSINESS', name: 'TIN Registration (Business)', category: 'TIN', ...p(4800.00, 5000.00), productCode: null },
  { id: 'TIN_RETRIEVAL_PERSONAL', name: 'TIN Retrieval (Personal)', category: 'TIN', ...p(1400.00, 1500.00), productCode: null },
  { id: 'TIN_RETRIEVAL_BUSINESS', name: 'TIN Retrieval (Business)', category: 'TIN', ...p(2400.00, 2500.00), productCode: null },

  // --- Exam Pin (Automated) ---
  { id: 'WAEC_PIN', name: 'WAEC Result Pin', category: 'EXAM_PINS', ...p(3550.00, 3600.00), productCode: 'waec_pin' },
  { id: 'NECO_PIN', name: 'NECO Result Pin', category: 'EXAM_PINS', ...p(1300.00, 1350.00), productCode: 'neco_pin' },
  { id: 'NABTEB_PIN', name: 'NABTEB Result Pin', category: 'EXAM_PINS', ...p(1000.00, 1050.00), productCode: 'nabteb_pin' },
  { id: 'JAMB_UTME_PIN', name: 'JAMB UTME Pin', category: 'EXAM_PINS', ...p(480.00, 500.00), productCode: 'utme_pin' },
  { id: 'JAMB_DE_PIN', name: 'JAMB Direct Entry (DE) Pin', category: 'EXAM_PINS', ...p(480.00, 500.00), productCode: 'direct_entry_de' },

  // --- Exam Result (Manual) ---
  { id: 'RESULT_REQUEST_WAEC', name: 'WAEC Result Request (Manual)', category: 'EXAM_PINS', ...p(950.00, 1000.00), productCode: null },
  { id: 'RESULT_REQUEST_NECO', name: 'NECO Result Request (Manual)', category: 'EXAM_PINS', ...p(950.00, 1000.00), productCode: null },
  { id: 'RESULT_REQUEST_NABTEB', name: 'NABTEB Result Request (Manual)', category: 'EXAM_PINS', ...p(950.00, 1000.00), productCode: null },

  // --- "World-Class" VTU ---

  // --- VTU Airtime ---
  { id: 'AIRTIME_MTN', name: 'MTN Airtime', category: 'VTU_AIRTIME', ...p(97.00, 98.00), productCode: 'mtn_custom' },
  { id: 'AIRTIME_GLO', name: 'Glo Airtime', category: 'VTU_AIRTIME', ...p(97.00, 98.00), productCode: 'glo_custom' },
  { id: 'AIRTIME_AIRTEL', name: 'Airtel Airtime', category: 'VTU_AIRTIME', ...p(97.00, 98.00), productCode: 'airtel_custom' },
  { id: 'AIRTIME_9MOBILE', name: '9Mobile Airtime', category: 'VTU_AIRTIME', ...p(97.00, 98.00), productCode: 'etisalat_custom' },

  // --- VTU Data: MTN (direct data) ---
  { id: 'DATA_MTN_GIFT_17GB_30D', name: 'MTN 17GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(5000, 5000), productCode: 'mtn_17gb30days' },
  { id: 'DATA_MTN_GIFT_250GB_90D', name: 'MTN 250GB (90 Days)', category: 'VTU_DATA_GIFTING', ...p(50000, 50000), productCode: 'mtn_250gb_90days' },
  { id: 'DATA_MTN_GIFT_20GB_30D_A', name: 'MTN 20GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(6000, 6000), productCode: 'mtn_20gb30days' },
  { id: 'DATA_MTN_GIFT_120GB_30D', name: 'MTN 120GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(20000, 20000), productCode: 'mtn_120gb30days' },
  { id: 'DATA_MTN_GIFT_30GB_60D', name: 'MTN 30GB (60 Days)', category: 'VTU_DATA_GIFTING', ...p(10000, 10000), productCode: 'mtn_30gb60days' },
  { id: 'DATA_MTN_GIFT_25GB_30D_A', name: 'MTN 25GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(8000, 8000), productCode: 'mtn_25gb30days' },
  { id: 'DATA_MTN_GIFT_1TB_365D', name: 'MTN 1TB (365 Days)', category: 'VTU_DATA_GIFTING', ...p(150000, 150000), productCode: 'mtn_1tb365days' },
  { id: 'DATA_MTN_GIFT_200GB_30D', name: 'MTN 200GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(30000, 30000), productCode: 'mtn_200gb30days' },
  { id: 'DATA_MTN_GIFT_100GB_60D', name: 'MTN 100GB (60 Days)', category: 'VTU_DATA_GIFTING', ...p(25000, 25000), productCode: 'mtn_100gb60days' },
  { id: 'DATA_MTN_GIFT_160GB_60D', name: 'MTN 160GB (60 Days)', category: 'VTU_DATA_GIFTING', ...p(35000, 35000), productCode: 'mtn_160gb60days' },
  { id: 'DATA_MTN_GIFT_1GB_1D', name: 'MTN 1GB (1 Day)', category: 'VTU_DATA_GIFTING', ...p(500, 500), productCode: 'mtn_1gb1_day' },
  { id: 'DATA_MTN_GIFT_3_5GB_2D', name: 'MTN 3.5GB (2 Days)', category: 'VTU_DATA_GIFTING', ...p(1000, 1000), productCode: 'mtn_3_5gb2_days' },
  { id: 'DATA_MTN_GIFT_15GB_7D', name: 'MTN 15GB (7 Days)', category: 'VTU_DATA_GIFTING', ...p(3000, 3000), productCode: 'mtn_15gb7_days' },
  { id: 'DATA_MTN_GIFT_10GB_30D_B', name: 'MTN 10GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(4477.5, 4500), productCode: 'mtn_10gb_30days' },
  { id: 'DATA_MTN_GIFT_2_7GB_30D_B', name: 'MTN 2.7GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(1990, 2000), productCode: 'mtn_2_7gb_30days' },
  { id: 'DATA_MTN_GIFT_20GB_30D_B', name: 'MTN 20GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(7462.5, 7500), productCode: 'mtn_20gb_30days' },
  { id: 'DATA_MTN_GIFT_25GB_30D_B', name: 'MTN 25GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(8955, 9000), productCode: 'mtn_25gb_30days' },
  { id: 'DATA_MTN_GIFT_75GB_30D_B', name: 'MTN 75GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(17910, 18000), productCode: 'mtn_75gb_30days' },
  { id: 'DATA_MTN_GIFT_250GB_30D_B', name: 'MTN 250GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(54725, 54800), productCode: 'mtn_250gb_30days' },
  { id: 'DATA_MTN_GIFT_90GB_60D_B', name: 'MTN 90GB (60 Days)', category: 'VTU_DATA_GIFTING', ...p(24875, 24900), productCode: 'mtn_90gb_60days' },
  { id: 'DATA_MTN_GIFT_200GB_60D_B', name: 'MTN 200GB (60 Days)', category: 'VTU_DATA_GIFTING', ...p(49750, 49800), productCode: 'mtn_200gb_60days' },
  { id: 'DATA_MTN_GIFT_150GB_60D_B', name: 'MTN 150GB (60 Days)', category: 'VTU_DATA_GIFTING', ...p(39800, 39900), productCode: 'mtn_150gb_60days' },
  { id: 'DATA_MTN_GIFT_2GB_30D_B', name: 'MTN 2GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(1492.5, 1500), productCode: 'mtn_2gb_30days' },
  { id: 'DATA_MTN_GIFT_3_5GB_30D_B', name: 'MTN 3.5GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(2487.5, 2500), productCode: 'mtn_3_5gb_30days' },
  { id: 'DATA_MTN_GIFT_12_5GB_30D_B', name: 'MTN 12.5GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(5472.5, 5500), productCode: 'mtn_12_5gb_30days' },
  { id: 'DATA_MTN_GIFT_16_5GB_30D_B', name: 'MTN 16.5GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(6467.5, 6500), productCode: 'mtn_16_5gb_30days' },
  { id: 'DATA_MTN_GIFT_36GB_30D_B', name: 'MTN 36GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(10945, 11000), productCode: 'mtn_36gb_30days' },
  { id: 'DATA_MTN_GIFT_165GB_30D_B', name: 'MTN 165GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(34825, 34900), productCode: 'mtn_165gb_30days' },
  { id: 'DATA_MTN_GIFT_7GB_30D_B', name: 'MTN 7GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(3482.5, 3500), productCode: 'mtn_7gb_30days' },
  { id: 'DATA_MTN_GIFT_800GB_365D_B', name: 'MTN 800GB (365 Days)', category: 'VTU_DATA_GIFTING', ...p(124375, 124500), productCode: 'mtn_800gb_365_days' },

  // --- VTU Data: Glo Direct Gifting ---
  { id: 'DATA_GLO_GIFT_2_6GB_30D', name: 'Glo 2.6GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(920, 930), productCode: 'glo_2_6gb30days' },
  { id: 'DATA_GLO_GIFT_5GB_30D', name: 'Glo 5GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(1380, 1395), productCode: 'glo_5gb30days' },
  { id: 'DATA_GLO_GIFT_6_15GB_30D', name: 'Glo 6.15GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(1840, 1860), productCode: 'glo_6_15gb30days' },
  { id: 'DATA_GLO_GIFT_7_25GB_30D', name: 'Glo 7.25GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(2300, 2325), productCode: 'glo_7_25gb30days' },
  { id: 'DATA_GLO_GIFT_10GB_30D', name: 'Glo 10GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(2760, 2790), productCode: 'glo_10gb30days' },
  { id: 'DATA_GLO_GIFT_12_5GB_30D', name: 'Glo 12.5GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(3690, 3720), productCode: 'glo_12_5gb30days' },
  { id: 'DATA_GLO_GIFT_16GB_30D', name: 'Glo 16GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(4620, 4650), productCode: 'glo_16gb30days' },
  { id: 'DATA_GLO_GIFT_28GB_30D', name: 'Glo 28GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(7400, 7440), productCode: 'glo_28gb30days' },
  { id: 'DATA_GLO_GIFT_38GB_30D', name: 'Glo 38GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(9250, 9300), productCode: 'glo_38gb30days' },
  { id: 'DATA_GLO_GIFT_64GB_30D', name: 'Glo 64GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(13900, 13950), productCode: 'glo_64gb30days' },
  { id: 'DATA_GLO_GIFT_107GB_30D', name: 'Glo 107GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(18500, 18600), productCode: 'glo_107gb30days' },
  { id: 'DATA_GLO_GIFT_135GB_30D', name: 'Glo 135GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(23150, 23250), productCode: 'glo_135gb30days' },
  { id: 'DATA_GLO_GIFT_165GB_30D', name: 'Glo 165GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(27800, 27900), productCode: 'glo_165gb30days' },
  { id: 'DATA_GLO_GIFT_220GB_30D', name: 'Glo 220GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(37100, 37200), productCode: 'glo_220gb30days' },
  { id: 'DATA_GLO_GIFT_310GB_60D', name: 'Glo 310GB (60 Days)', category: 'VTU_DATA_GIFTING', ...p(46400, 46500), productCode: 'glo_310gb60days' },
  { id: 'DATA_GLO_GIFT_380GB_90D', name: 'Glo 380GB (90 Days)', category: 'VTU_DATA_GIFTING', ...p(55700, 55800), productCode: 'glo_380gb90days' },
  { id: 'DATA_GLO_GIFT_475GB_90D', name: 'Glo 475GB (90 Days)', category: 'VTU_DATA_GIFTING', ...p(69650, 69750), productCode: 'glo_475gb90days' },
  { id: 'DATA_GLO_GIFT_1TB_365D', name: 'Glo 1TB (365 Days)', category: 'VTU_DATA_GIFTING', ...p(139400, 139500), productCode: 'glo_1tb365days' },

  // --- VTU Data: Airtel Direct Gifting ---
  { id: 'DATA_AIRTEL_GIFT_2GB_30D', name: 'Airtel 2GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(1450, 1470), productCode: 'airtel_2gb30days' },
  { id: 'DATA_AIRTEL_GIFT_3GB_30D', name: 'Airtel 3GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(1940, 1960), productCode: 'airtel_3gb30days' },
  { id: 'DATA_AIRTEL_GIFT_10GB_30D', name: 'Airtel 10GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(3900, 3920), productCode: 'airtel_10gb30days' },
  { id: 'DATA_AIRTEL_GIFT_1GB_7D', name: 'Airtel 1GB (7 Days)', category: 'VTU_DATA_GIFTING', ...p(770, 784), productCode: 'airtel_1gb7_days' },
  { id: 'DATA_AIRTEL_GIFT_500MB_7D', name: 'Airtel 500mb (7 Days)', category: 'VTU_DATA_GIFTING', ...p(480, 490), productCode: 'airtel_500mb7_days' },
  { id: 'DATA_AIRTEL_GIFT_4GB_30D', name: 'Airtel 4GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(2430, 2450), productCode: 'airtel_4gb30days' },
  { id: 'DATA_AIRTEL_GIFT_8GB_30D', name: 'Airtel 8GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(2910, 2940), productCode: 'airtel_8gb30days' },
  { id: 'DATA_AIRTEL_GIFT_13GB_30D', name: 'Airtel 13GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(4850, 4900), productCode: 'airtel_13gb30days' },
  { id: 'DATA_AIRTEL_GIFT_18GB_30D', name: 'Airtel 18GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(5830, 5880), productCode: 'airtel_18gb30days' },
  { id: 'DATA_AIRTEL_GIFT_25GB_30D', name: 'Airtel 25GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(7800, 7840), productCode: 'airtel_25gb30days' },
  { id: 'DATA_AIRTEL_GIFT_35GB_30D', name: 'Airtel 35GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(9750, 9800), productCode: 'airtel_35gb30days' },
  { id: 'DATA_AIRTEL_GIFT_60GB_30D', name: 'Airtel 60GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(14600, 14700), productCode: 'airtel_60gb30days' },
  { id: 'DATA_AIRTEL_GIFT_100GB_30D', name: 'Airtel 100GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(19500, 19600), productCode: 'airtel_100gb30days' },
  { id: 'DATA_AIRTEL_GIFT_160GB_30D', name: 'Airtel 160GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(29300, 29400), productCode: 'airtel_160gb30days' },
  { id: 'DATA_AIRTEL_GIFT_210GB_30D', name: 'Airtel 210GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(39100, 39200), productCode: 'airtel_210gb30days' },
  { id: 'DATA_AIRTEL_GIFT_300GB_90D', name: 'Airtel 300GB (90 Days)', category: 'VTU_DATA_GIFTING', ...p(48900, 49000), productCode: 'airtel_300gb90days' },
  { id: 'DATA_AIRTEL_GIFT_650GB_365D', name: 'Airtel 650GB (365 Days)', category: 'VTU_DATA_GIFTING', ...p(97900, 98000), productCode: 'airtel_650gb365days' },

  // --- VTU Data: 9mobile Direct Gifting ---
  { id: 'DATA_9M_GIFT_2GB_30D', name: '9Mobile 2GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(1480, 1500), productCode: 'etisalat_2gb30days' },
  { id: 'DATA_9M_GIFT_4_5GB_30D', name: '9Mobile 4.5GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(1980, 2000), productCode: 'etisalat_4_5gb30days' },
  { id: 'DATA_9M_GIFT_11GB_30D', name: '9Mobile 11GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(3950, 4000), productCode: 'etisalat_11gb30days' },
  { id: 'DATA_9M_GIFT_75GB_30D', name: '9Mobile 75GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(14900, 15000), productCode: 'etisalat_75gb30days' },
  { id: 'DATA_9M_GIFT_1_5GB_30D', name: '9Mobile 1.5GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(1180, 1200), productCode: 'etisalat_1_5gb30days' },
  { id: 'DATA_9M_GIFT_40GB_30D', name: '9Mobile 40GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(9900, 10000), productCode: 'etisalat_40gb30days' },
  { id: 'DATA_9M_GIFT_3GB_30D', name: '9Mobile 3GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(1780, 1800), productCode: 'etisalat_3gb30days' },
  { id: 'DATA_9M_GIFT_15GB_30D', name: '9Mobile 15GB (30 Days)', category: 'VTU_DATA_GIFTING', ...p(4950, 5000), productCode: 'etisalat_15gb30days' },
  { id: 'DATA_9M_GIFT_75GB_3M', name: '9Mobile 75GB (3 Months)', category: 'VTU_DATA_GIFTING', ...p(24900, 25000), productCode: 'etisalat_75gb3_months' },
  { id: 'DATA_9M_GIFT_165GB_6M', name: '9Mobile 165GB (6 Months)', category: 'VTU_DATA_GIFTING', ...p(49800, 50000), productCode: 'etisalat_165gb6_months' },
  { id: 'DATA_9M_GIFT_365GB_1Y', name: '9Mobile 365GB (1 Year)', category: 'VTU_DATA_GIFTING', ...p(99800, 100000), productCode: 'etisalat_365gb1_year' },

  // --- VTU Data: Glo Cloud Data (Setting 50 as placeholder) ---
  { id: 'DATA_GLO_CLOUD_50MB_1D_A', name: 'Glo Cloud 50MB (1 Day)', category: 'VTU_DATA_CLOUD', ...p(50, 50), productCode: 'glo_cloud_50mb_incl_5mb_nite1day' },
  { id: 'DATA_GLO_CLOUD_350MB_2D_A', name: 'Glo Cloud 350MB (2 Days)', category: 'VTU_DATA_CLOUD', ...p(100, 100), productCode: 'glo_cloud_350mb_incl_110mb_nite2days' },
  { id: 'DATA_GLO_CLOUD_1_8GB_14D_A', name: 'Glo Cloud 1.8GB (14 Days)', category: 'VTU_DATA_CLOUD', ...p(500, 500), productCode: 'glo_cloud_1_8gb_incl_1gb_nite14days' },
  { id: 'DATA_GLO_CLOUD_150MB_1D_A', name: 'Glo Cloud 150MB (1 Day)', category: 'VTU_DATA_CLOUD', ...p(100, 100), productCode: 'glo_cloud_150mb_incl_35mb_nite1day' },
  { id: 'DATA_GLO_CLOUD_250MB_N_1D_A', name: 'Glo Cloud 250MB Night (1 Day)', category: 'VTU_DATA_CLOUD', ...p(50, 50), productCode: 'glo_cloud_250mb_night1day' },
  { id: 'DATA_GLO_CLOUD_7GB_S_7D_A', name: 'Glo Cloud 7GB Special (7 Days)', category: 'VTU_DATA_CLOUD', ...p(1500, 1500), productCode: 'glo_cloud_7gb_special7days' },
  { id: 'DATA_GLO_CLOUD_100MB_WTF_1D', name: 'Glo Cloud 100MB WTF (1 Day)', category: 'VTU_DATA_CLOUD', ...p(100, 100), productCode: 'glo_cloud_100mb_wtf1day' },
  { id: 'DATA_GLO_CLOUD_200MB_WTF_7D', name: 'Glo Cloud 200MB WTF (7 Days)', category: 'VTU_DATA_CLOUD', ...p(200, 200), productCode: 'glo_cloud_200mb_wtf7days' },
  { id: 'DATA_GLO_CLOUD_500MB_WTF_30D', name: 'Glo Cloud 500MB WTF (30 Days)', category: 'VTU_DATA_CLOUD', ...p(500, 500), productCode: 'glo_cloud_500mb_wtf30days' },
  { id: 'DATA_GLO_CLOUD_20MB_TEL_1D', name: 'Glo Cloud 20MB Telegram (1 Day)', category: 'VTU_DATA_CLOUD', ...p(25, 25), productCode: 'glo_cloud_20mb_telegram1day' },
  { id: 'DATA_GLO_CLOUD_50MB_TEL_7D', name: 'Glo Cloud 50MB Telegram (7 Days)', category: 'VTU_DATA_CLOUD', ...p(50, 50), productCode: 'glo_cloud_50mb_telegram7days' },
  { id: 'DATA_GLO_CLOUD_125MB_TEL_30D', name: 'Glo Cloud 125MB Telegram (30 Days)', category: 'VTU_DATA_CLOUD', ...p(100, 100), productCode: 'glo_cloud_125mb_telegram30days' },
  { id: 'DATA_GLO_CLOUD_20MB_INSTA_1D', name: 'Glo Cloud 20MB Instagram (1 Day)', category: 'VTU_DATA_CLOUD', ...p(25, 25), productCode: 'glo_cloud_20mb_instagram1day' },
  { id: 'DATA_GLO_CLOUD_50MB_INSTA_7D', name: 'Glo Cloud 50MB Instagram (7 Days)', category: 'VTU_DATA_CLOUD', ...p(50, 50), productCode: 'glo_cloud_50mb_instagram7days' },
  { id: 'DATA_GLO_CLOUD_125MB_INSTA_30D', name: 'Glo Cloud 125MB Instagram (30 Days)', category: 'VTU_DATA_CLOUD', ...p(100, 100), productCode: 'glo_cloud125mb_instagram30days' },
  { id: 'DATA_GLO_CLOUD_20MB_TIKTOK_1D', name: 'Glo Cloud 20MB Tiktok (1 Day)', category: 'VTU_DATA_CLOUD', ...p(25, 25), productCode: 'glo_cloud_20mb_tiktok1day' },
  { id: 'DATA_GLO_CLOUD_50MB_TIKTOK_7D', name: 'Glo Cloud 50MB Tiktok (7 Days)', category: 'VTU_DATA_CLOUD', ...p(50, 50), productCode: 'glo_cloud_50mb_tiktok7days' },
  { id: 'DATA_GLO_CLOUD_125MB_TIKTOK_30D', name: 'Glo Cloud 125MB Tiktok (30 Days)', category: 'VTU_DATA_CLOUD', ...p(100, 100), productCode: 'glo_cloud_125mb_tiktok30days' },
  { id: 'DATA_GLO_CLOUD_20MB_OPERA_1D', name: 'Glo Cloud 20MB Opera (1 Day)', category: 'VTU_DATA_CLOUD', ...p(25, 25), productCode: 'glo_cloud_20mb_opera1day' },
  { id: 'DATA_GLO_CLOUD_100MB_OPERA_7D', name: 'Glo Cloud 100MB Opera (7 Days)', category: 'VTU_DATA_CLOUD', ...p(50, 50), productCode: 'glo_cloud_100mb_opera7days' },
  { id: 'DATA_GLO_CLOUD_300MB_OPERA_30D', name: 'Glo Cloud 300MB Opera (30 Days)', category: 'VTU_DATA_CLOUD', ...p(100, 100), productCode: 'glo_cloud_300mb_opera30days' },
  { id: 'DATA_GLO_CLOUD_100MB_YT_1D', name: 'Glo Cloud 100MB Youtube (1 Day)', category: 'VTU_DATA_CLOUD', ...p(50, 50), productCode: 'glo_cloud_100mb_youtube1day' },
  { id: 'DATA_GLO_CLOUD_200MB_YT_7D', name: 'Glo Cloud 200MB Youtube (7 Days)', category: 'VTU_DATA_CLOUD', ...p(100, 100), productCode: 'glo_cloud_200mb_youtube7days' },
  { id: 'DATA_GLO_CLOUD_500MB_YT_30D', name: 'Glo Cloud 500MB Youtube (30 Days)', category: 'VTU_DATA_CLOUD', ...p(250, 250), productCode: 'glo_cloud_500mb_youtube30days' },
  { id: 'DATA_GLO_CLOUD_3_9GB_N_30D', name: 'Glo Cloud 3.9GB (30 Days)', category: 'VTU_DATA_CLOUD', ...p(1000, 1000), productCode: 'glo_cloud_3_9gb_incl_2gb_nite30days' },
  { id: 'DATA_GLO_CLOUD_7_5GB_N_30D', name: 'Glo Cloud 7.5GB (30 Days)', category: 'VTU_DATA_CLOUD', ...p(1500, 1500), productCode: 'glo_cloud_7_5gb_incl_4gb_nite30days' },
  { id: 'DATA_GLO_CLOUD_9_2GB_N_30D', name: 'Glo Cloud 9.2GB (30 Days)', category: 'VTU_DATA_CLOUD', ...p(2000, 2000), productCode: 'glo_cloud_9_2gb_incl_4gb_nite30days' },
  { id: 'DATA_GLO_CLOUD_500MB_N_1D', name: 'Glo Cloud 500MB Night (1 Day)', category: 'VTU_DATA_CLOUD', ...p(100, 100), productCode: 'glo_cloud_500mb_night1day' },
  { id: 'DATA_GLO_CLOUD_1GB_N_1D', name: 'Glo Cloud 1GB Night (1 Day)', category: 'VTU_DATA_CLOUD', ...p(150, 150), productCode: 'glo_cloud_1gb_night1day' },
  { id: 'DATA_GLO_CLOUD_20MB_WC_1D', name: 'Glo Cloud 20MB Wechat (1 Day)', category: 'VTU_DATA_CLOUD', ...p(25, 25), productCode: 'glo_cloud_20mb_wechat1day' },
  { id: 'DATA_GLO_CLOUD_50MB_WC_7D', name: 'Glo Cloud 50MB Wechat (7 Days)', category: 'VTU_DATA_CLOUD', ...p(50, 50), productCode: 'glo_cloud_50mb_wechat7days' },
  { id: 'DATA_GLO_CLOUD_125MB_WC_30D', name: 'Glo Cloud 125MB Wechat (30 Days)', category: 'VTU_DATA_CLOUD', ...p(100, 100), productCode: 'glo_cloud_125mb_wechat30days' },
  { id: 'DATA_GLO_CLOUD_20MB_ESK_1D', name: 'Glo Cloud 20MB Eskimi (1 Day)', category: 'VTU_DATA_CLOUD', ...p(25, 25), productCode: 'glo_cloud_20mb_eskimi1day' },
  { id: 'DATA_GLO_CLOUD_50MB_ESK_7D', name: 'Glo Cloud 50MB Eskimi (7 Days)', category: 'VTU_DATA_CLOUD', ...p(50, 50), productCode: 'glo_cloud_50mb_eskimi7days' },
  { id: 'DATA_GLO_CLOUD_125MB_ESK_30D', name: 'Glo Cloud 125MB Eskimi (30 Days)', category: 'VTU_DATA_CLOUD', ...p(100, 100), productCode: 'glo_cloud_125mb_eskimi30days' },
  { id: 'DATA_GLO_CLOUD_25MB_OPERA_1D', name: 'Glo Cloud 25MB Opera (1 Day)', category: 'VTU_DATA_CLOUD', ...p(25, 25), productCode: 'glo_cloud_25mb_opera1day' },
  { id: 'DATA_GLO_CLOUD_50MB_YT_1D', name: 'Glo Cloud 50MB Youtube (1 Day)', category: 'VTU_DATA_CLOUD', ...p(50, 50), productCode: 'glo_cloud_50mb_youtube1day' },
  { id: 'DATA_GLO_CLOUD_100MB_YT_7D', name: 'Glo Cloud 100MB Youtube (7 Days)', category: 'VTU_DATA_CLOUD', ...p(100, 100), productCode: 'glo_cloud_100mb_youtube7days' },
  { id: 'DATA_GLO_CLOUD_1_25GB_SUN_1D', name: 'Glo Cloud 1.25GB Sunday (1 Day)', category: 'VTU_DATA_CLOUD', ...p(200, 200), productCode: 'glo_cloud_1_25gb_sunday1day' },
  { id: 'DATA_GLO_CLOUD_50MB_1D_B', name: 'Glo Cloud 50MB (1 Day)', category: 'VTU_DATA_CLOUD', ...p(50, 50), productCode: 'glo_cloud_50mb1day' },
  { id: 'DATA_GLO_CLOUD_150MB_1D_B', name: 'Glo Cloud 150MB (1 Day)', category: 'VTU_DATA_CLOUD', ...p(100, 100), productCode: 'glo_cloud_150mb1day' },
  { id: 'DATA_GLO_CLOUD_350MB_2D_B', name: 'Glo Cloud 350MB (2 Days)', category: 'VTU_DATA_CLOUD', ...p(200, 200), productCode: 'glo_cloud_350mb2days' },
  { id: 'DATA_GLO_CLOUD_1GB_14D_B', name: 'Glo Cloud 1GB (14 Days)', category: 'VTU_DATA_CLOUD', ...p(500, 500), productCode: 'glo_cloud_1gb14days' },
  { id: 'DATA_GLO_CLOUD_3_9GB_30D_B', name: 'Glo Cloud 3.9GB (30 Days)', category: 'VTU_DATA_CLOUD', ...p(1000, 1000), productCode: 'glo_cloud_3_9gb30days' },
  { id: 'DATA_GLO_CLOUD_4_1GB_30D_B', name: 'Glo Cloud 4.1GB (30 Days)', category: 'VTU_DATA_CLOUD', ...p(1000, 1000), productCode: 'glo_cloud_4_1gb30days' },
  { id: 'DATA_GLO_CLOUD_5_8GB_30D_B', name: 'Glo Cloud 5.8GB (30 Days)', category: 'VTU_DATA_CLOUD', ...p(1500, 1500), productCode: 'glo_cloud_5_8gb30days' },
  { id: 'DATA_GLO_CLOUD_1_35GB_14D_B', name: 'Glo Cloud 1.35GB (14 Days)', category: 'VTU_DATA_CLOUD', ...p(500, 500), productCode: 'glo_cloud_1_35gb14days' },
  { id: 'DATA_GLO_CLOUD_50MB_YT_T_1D', name: 'Glo Cloud 50MB Youtube Time (1 Day)', category: 'VTU_DATA_CLOUD', ...p(50, 50), productCode: 'glo_cloud_50mb_youtube_50_time1day' },
  { id: 'DATA_GLO_CLOUD_1_5GB_YT_T_1D', name: 'Glo Cloud 1.5GB Youtube Time (1 Day)', category: 'VTU_DATA_CLOUD', ...p(130, 130), productCode: 'glo_cloud_1_5gb_youtube_130_time1day' },
  { id: 'DATA_GLO_CLOUD_500MB_YT_N_1D', name: 'Glo Cloud 500MB Youtube Night (1 Day)', category: 'VTU_DATA_CLOUD', ...p(50, 50), productCode: 'glo_cloud_500mb_youtube_50_night_time1day' },
  { id: 'DATA_GLO_CLOUD_2GB_YT_N_7D', name: 'Glo Cloud 2GB Youtube Night (7 Days)', category: 'VTU_DATA_CLOUD', ...p(200, 200), productCode: 'glo_cloud_2gb_youtube_200_night_time7days' },
  { id: 'DATA_GLO_CLOUD_500MB_YT_T_O_1D', name: 'Glo Cloud 500MB Youtube Time Oneoff (1 Day)', category: 'VTU_DATA_CLOUD', ...p(50, 50), productCode: 'glo_cloud_500mb_youtube_50_time_oneoff1day' },
  { id: 'DATA_GLO_CLOUD_1_5GB_YT_T_O_1D', name: 'Glo Cloud 1.5GB Youtube Time Oneoff (1 Day)', category: 'VTU_DATA_CLOUD', ...p(130, 130), productCode: 'glo_cloud_1_5gb_youtube_130_time_oneoff1day' },
  { id: 'DATA_GLO_CLOUD_500MB_YT_N_O_1D', name: 'Glo Cloud 500MB Youtube Night Oneoff (1 Day)', category: 'VTU_DATA_CLOUD', ...p(50, 50), productCode: 'glo_cloud_500mb_youtube_50_time_night_oneoff1day' },
  { id: 'DATA_GLO_CLOUD_2GB_YT_N_O_7D', name: 'Glo Cloud 2GB Youtube Night Oneoff (7 Days)', category: 'VTU_DATA_CLOUD', ...p(200, 200), productCode: 'glo_cloud_2gb_youtube_200_time_night_oneoff7days' },
  { id: 'DATA_GLO_CLOUD_1GB_S_300_1D', name: 'Glo Cloud 1GB Special 300 (1 Day)', category: 'VTU_DATA_CLOUD', ...p(300, 300), productCode: 'glo_cloud_1gb_special_3001day' },
  { id: 'DATA_GLO_CLOUD_2GB_S_500_2D', name: 'Glo Cloud 2GB Special 500 (2 Days)', category: 'VTU_DATA_CLOUD', ...p(500, 500), productCode: 'glo_cloud_2gb_special_5002days' },
  { id: 'DATA_GLO_CLOUD_3_58GB_1500_O_30D', name: 'Glo Cloud 3.58GB N1500 Oneoff (30 Days)', category: 'VTU_DATA_CLOUD', ...p(1500, 1500), productCode: 'glo_cloud_3_58gb_n1500_oneoff30days' },
  { id: 'DATA_GLO_CLOUD_3GB_WKD_500_2D', name: 'Glo Cloud 3GB Weekend 500 (2 Days)', category: 'VTU_DATA_CLOUD', ...p(500, 500), productCode: 'glo_cloud_3gb_weekend5002days' },
  { id: 'DATA_GLO_CLOUD_1_5GB_YT_500_30D', name: 'Glo Cloud 1.5GB Youtube N500 (30 Days)', category: 'VTU_DATA_CLOUD', ...p(500, 500), productCode: 'glo_cloud_1_5gb_youtube_n50030days' },
  { id: 'DATA_GLO_CLOUD_4GB_YT_1000_30D', name: 'Glo Cloud 4GB Youtube N1000 (30 Days)', category: 'VTU_DATA_CLOUD', ...p(1000, 1000), productCode: 'glo_cloud_4gb_youtube_n100030days' },
  { id: 'DATA_GLO_CLOUD_5GB_YT_T_500_5D', name: 'Glo Cloud 5GB Youtube Time N500 (5 Days)', category: 'VTU_DATA_CLOUD', ...p(500, 500), productCode: 'glo_cloud_5gb_youtube_n500_time5days' },
  { id: 'DATA_GLO_CLOUD_10GB_YT_T_1000_10D', name: 'Glo Cloud 10GB Youtube Time N1000 (10 Days)', category: 'VTU_DATA_CLOUD', ...p(1000, 1000), productCode: 'glo_cloud_10gb_youtube_n1000_time10days' },
  { id: 'DATA_GLO_CLOUD_1_5GB_YT_500_O_30D', name: 'Glo Cloud 1.5GB Youtube N500 Oneoff (30 Days)', category: 'VTU_DATA_CLOUD', ...p(500, 500), productCode: 'glo_cloud_1_5gb_youtube_n500_oneoff30days' },
  { id: 'DATA_GLO_CLOUD_4GB_YT_1000_O_30D', name: 'Glo Cloud 4GB Youtube N1000 Oneoff (30 Days)', category: 'VTU_DATA_CLOUD', ...p(1000, 1000), productCode: 'glo_cloud_4gb_youtube_n1000_oneoff30days' },
  { id: 'DATA_GLO_CLOUD_5GB_YT_T_500_O_5D', name: 'Glo Cloud 5GB Youtube Time N500 Oneoff (5 Days)', category: 'VTU_DATA_CLOUD', ...p(500, 500), productCode: 'glo_cloud_5gb_youtube_n500_time_oneoff5days' },
  { id: 'DATA_GLO_CLOUD_10GB_YT_T_1000_O_10D', name: 'Glo Cloud 10GB Youtube Time N1000 Oneoff (10 Days)', category: 'VTU_DATA_CLOUD', ...p(1000, 1000), productCode: 'glo_cloud_10gb_youtube_n1000_time_oneoff10days' },
  { id: 'DATA_GLO_CLOUD_CB_1000_5_8GB_30D', name: 'Glo Cloud Camp-Boost 1000 5.8GB (30 Days)', category: 'VTU_DATA_CLOUD', ...p(1000, 1000), productCode: 'glo_cloud_camp-boost_10003_8gb__2gb_nite_5_8gb30days' },
  { id: 'DATA_GLO_CLOUD_CB_2000_14_4GB_30D', name: 'Glo Cloud Camp-Boost 2000 14.4GB (30 Days)', category: 'VTU_DATA_CLOUD', ...p(2000, 2000), productCode: 'glo_cloud_camp-boost_200010_4__4gb_nite_14_4gb30days' },
  { id: 'DATA_GLO_CLOUD_CB_100_265MB_1D', name: 'Glo Cloud Camp-Boost 100 265MB (1 Day)', category: 'VTU_DATA_CLOUD', ...p(100, 100), productCode: 'glo_cloud_camp-boost_100230mb__35mb_nite_265mb1day' },
  { id: 'DATA_GLO_CLOUD_CB_200_590MB_2D', name: 'Glo Cloud Camp-Boost 200 590MB (2 Days)', category: 'VTU_DATA_CLOUD', ...p(200, 200), productCode: 'glo_cloud_camp-boost_200480mb__110mb_nite_590mb2days' },
  { id: 'DATA_GLO_CLOUD_CB_500_2_6GB_14D', name: 'Glo Cloud Camp-Boost 500 2.6GB (14 Days)', category: 'VTU_DATA_CLOUD', ...p(500, 500), productCode: 'glo_cloud_camp-boost_5001_6gb__1gb_nite_2_6gb14days' },

  // --- VTU Data: MTN SME ---
  { id: 'DATA_MTN_SME_1GB', name: 'MTN SME 1GB', category: 'VTU_DATA_SME', ...p(470, 480), productCode: 'mtn_sme_1gb' },
  { id: 'DATA_MTN_SME_2GB', name: 'MTN SME 2GB', category: 'VTU_DATA_SME', ...p(1080, 1100), productCode: 'data_share_2gb' },
  { id: 'DATA_MTN_SME_5GB', name: 'MTN SME 5GB', category: 'VTU_DATA_SME', ...p(2730, 2750), productCode: 'data_share_5gb' },
  { id: 'DATA_MTN_SME_500MB', name: 'MTN SME 500MB', category: 'VTU_DATA_SME', ...p(360, 365), productCode: 'mtn_sme_500mb' },
  { id: 'DATA_MTN_SME_3GB', name: 'MTN SME 3GB', category: 'VTU_DATA_SME', ...p(1630, 1650), productCode: 'data_share_3gb' },
  { id: 'DATA_MTN_SME_10GB', name: 'MTN SME 10GB', category: 'VTU_DATA_SME', ...p(5450, 5500), productCode: 'data_share_10gb' },
  { id: 'DATA_MTN_SME_1GB_M', name: 'MTN SME 1GB Monthly', category: 'VTU_DATA_SME', ...p(580, 590), productCode: 'mtn_sme_igb_monthly' },

  // --- VTU Data: Glo Corporate ---
  { id: 'DATA_GLO_CG_200MB_14D', name: 'Glo CG 200MB (14 Days)', category: 'VTU_DATA_CG', ...p(78, 79.8), productCode: 'glo_cg_200mb_14days' },
  { id: 'DATA_GLO_CG_500MB_30D', name: 'Glo CG 500MB (30 Days)', category: 'VTU_DATA_CG', ...p(195, 199.5), productCode: 'glo_cg_500mb_30days' },
  { id: 'DATA_GLO_CG_1GB_30D', name: 'Glo CG 1GB (30 Days)', category: 'VTU_DATA_CG', ...p(390, 399), productCode: 'glo_cg_1gb_30days' },
  { id: 'DATA_GLO_CG_2GB_30D', name: 'Glo CG 2GB (30 Days)', category: 'VTU_DATA_CG', ...p(790, 798), productCode: 'glo_cg_2gb_30days' },
  { id: 'DATA_GLO_CG_3GB_30D', name: 'Glo CG 3GB (30 Days)', category: 'VTU_DATA_CG', ...p(1180, 1197), productCode: 'glo_cg_3gb_30days' },
  { id: 'DATA_GLO_CG_5GB_30D', name: 'Glo CG 5GB (30 Days)', category: 'VTU_DATA_CG', ...p(1980, 1995), productCode: 'glo_cg_5gb_30days' },
  { id: 'DATA_GLO_CG_10GB_30D', name: 'Glo CG 10GB (30 Days)', category: 'VTU_DATA_CG', ...p(3970, 3990), productCode: 'glo_cg_10gb_30days' },
  { id: 'DATA_GLO_CG_1GB_3D', name: 'Glo CG 1GB (3 Days)', category: 'VTU_DATA_CG', ...p(265, 270), productCode: 'glo_cg_1gb_3_days' },
  { id: 'DATA_GLO_CG_3GB_3D', name: 'Glo CG 3GB (3 Days)', category: 'VTU_DATA_CG', ...p(800, 810), productCode: 'glo_cg_3gb_3_days' },
  { id: 'DATA_GLO_CG_5GB_3D', name: 'Glo CG 5GB (3 Days)', category: 'VTU_DATA_CG', ...p(1330, 1350), productCode: 'glo_cg_5gb_3_days' },
  { id: 'DATA_GLO_CG_1GB_7D', name: 'Glo CG 1GB (7 Days)', category: 'VTU_DATA_CG', ...p(310, 320), productCode: 'glo_cg_1gb_7_days' },
  { id: 'DATA_GLO_CG_3GB_7D', name: 'Glo CG 3GB (7 Days)', category: 'VTU_DATA_CG', ...p(940, 960), productCode: 'glo_cg_3gb_7_days' },
  { id: 'DATA_GLO_CG_5GB_7D', name: 'Glo CG 5GB (7 Days)', category: 'VTU_DATA_CG', ...p(1580, 1600), productCode: 'glo_cg_5gb_7_days' },

  // --- VTU Data: Airtel Corporate ---
  { id: 'DATA_AIRTEL_CG_100MB_7D_A', name: 'Airtel 100MB (7 Days)', category: 'VTU_DATA_CG', ...p(98, 100), productCode: 'airtel_100mb_7days' },
  { id: 'DATA_AIRTEL_CG_300MB_7D_A', name: 'Airtel 300MB (7 Days)', category: 'VTU_DATA_CG', ...p(145, 150), productCode: 'airtel_300mb_7days' },
  { id: 'DATA_AIRTEL_CG_500MB_30D_A', name: 'Airtel 500MB (30 Days)', category: 'VTU_DATA_CG', ...p(190, 200), productCode: 'airtel_500mb_30days' },
  { id: 'DATA_AIRTEL_CG_1GB_30D_A', name: 'Airtel 1GB (30 Days)', category: 'VTU_DATA_CG', ...p(290, 300), productCode: 'airtel_1gb_30days' },

  // --- VTU Data: 9mobile SME ---
  { id: 'DATA_9M_SME_1GB_A', name: '9Mobile SME 1GB', category: 'VTU_DATA_SME', ...p(290, 300), productCode: 'etisalat_sme_1gb' },
  { id: 'DATA_9M_SME_1_5GB_A', name: '9Mobile SME 1.5GB', category: 'VTU_DATA_SME', ...p(440, 450), productCode: 'etisalat_sme_1_5gb' },
  { id: 'DATA_9M_SME_2GB_A', name: '9Mobile SME 2GB', category: 'VTU_DATA_SME', ...p(580, 600), productCode: 'etisalat_sme_2gb' },
  { id: 'DATA_9M_SME_3GB_A', name: '9Mobile SME 3GB', category: 'VTU_DATA_SME', ...p(880, 900), productCode: 'etisalat_sme_3gb' },
  { id: 'DATA_9M_SME_5GB_A', name: '9Mobile SME 5GB', category: 'VTU_DATA_SME', ...p(1480, 1500), productCode: 'etisalat_sme_5gb' },
  { id: 'DATA_9M_SME_10GB_A', name: '9Mobile SME 10GB', category: 'VTU_DATA_SME', ...p(2950, 3000), productCode: 'etisalat_sme_10gb' },
  { id: 'DATA_9M_SME_15GB_A', name: '9Mobile SME 15GB', category: 'VTU_DATA_SME', ...p(4450, 4500), productCode: 'etisalat_sme_15gb' },
  { id: 'DATA_9M_SME_20GB_A', name: '9Mobile SME 20GB', category: 'VTU_DATA_SME', ...p(5900, 6000), productCode: 'etisalat_sme_20gb' },
  { id: 'DATA_9M_SME_50GB_A', name: '9Mobile SME 50GB', category: 'VTU_DATA_SME', ...p(14900, 15000), productCode: 'etisalat_sme_50gb' },
  { id: 'DATA_9M_SME_500MB_A', name: '9Mobile SME 500MB', category: 'VTU_DATA_SME', ...p(145, 150), productCode: 'etisalat_sme_500mb' },
  { id: 'DATA_9M_SME_100GB_A', name: '9Mobile SME 100GB', category: 'VTU_DATA_SME', ...p(29800, 30000), productCode: 'etisalat_sme_100gb' },

  // --- VTU Data: MTN Corporate Data ---
  { id: 'DATA_MTN_CG_10GB_A', name: 'MTN CG 10GB', category: 'VTU_DATA_CG', ...p(2950, 3000), productCode: 'corporate_data_10gb' },
  { id: 'DATA_MTN_CG_5GB_A', name: 'MTN CG 5GB', category: 'VTU_DATA_CG', ...p(1480, 1500), productCode: 'corporate_data_5gb' },
  { id: 'DATA_MTN_CG_3GB_A', name: 'MTN CG 3GB', category: 'VTU_DATA_CG', ...p(880, 900), productCode: 'corporate_data_3gb' },
  { id: 'DATA_MTN_CG_2GB_A', name: 'MTN CG 2GB', category: 'VTU_DATA_CG', ...p(580, 600), productCode: 'corporate_data_2gb' },
  { id: 'DATA_MTN_CG_1GB_A', name: 'MTN CG 1GB', category: 'VTU_DATA_CG', ...p(290, 300), productCode: 'corporate_data_1gb' },
  { id: 'DATA_MTN_CG_500MB_A', name: 'MTN CG 500MB', category: 'VTU_DATA_CG', ...p(145, 150), productCode: 'corporate_data_500mb' },

  // --- VTU Data: Mtn direct data coupon ---
  { id: 'DATA_MTN_COUPON_3GB_30D', name: 'MTN 3GB (30 Days) Coupon', category: 'VTU_DATA_COUPON', ...p(990, 1000), productCode: 'mtn_3gb_30_days_coupon' },
  { id: 'DATA_MTN_COUPON_9GB_30D', name: 'MTN 9GB (30 Days) Coupon', category: 'VTU_DATA_COUPON', ...p(1980, 2000), productCode: 'mtn_9gb_30_days_coupon' },
  { id: 'DATA_MTN_COUPON_12GB_30D', name: 'MTN 12GB (30 Days) Coupon', category: 'VTU_DATA_COUPON', ...p(2970, 3000), productCode: 'mtn_12gb_30_days_coupon' },
  { id: 'DATA_MTN_COUPON_24GB_30D', name: 'MTN 24GB (30 Days) Coupon', category: 'VTU_DATA_COUPON', ...p(3960, 4000), productCode: 'mtn_24gb_30_days_coupon' },
  { id: 'DATA_MTN_COUPON_6GB_30D', name: 'MTN 6GB (30 Days) Coupon', category: 'VTU_DATA_COUPON', ...p(1480, 1500), productCode: 'mtn_6gb_30_days_coupon' },

  // --- VTU Data: Mtn data share ---
  { id: 'DATA_MTN_SHARE_5GB', name: 'MTN 5GB Data share', category: 'VTU_DATA_SHARE', ...p(2450, 2500), productCode: 'mtn_5gb_data_share' },
  { id: 'DATA_MTN_SHARE_3GB', name: 'MTN 3GB Data share', category: 'VTU_DATA_SHARE', ...p(1650, 1700), productCode: 'mtn_3gb_data_share' },
  { id: 'DATA_MTN_SHARE_2GB', name: 'MTN 2GB Data share', category: 'VTU_DATA_SHARE', ...p(1100, 1150), productCode: 'mtn_2gb_data_share' },
  { id: 'DATA_MTN_SHARE_1GB', name: 'MTN 1GB Data share', category: 'VTU_DATA_SHARE', ...p(470, 480), productCode: 'mtn_1gb_data_share' },
  { id: 'DATA_MTN_SHARE_500MB', name: 'MTN 500MB Data share', category: 'VTU_DATA_SHARE', ...p(360, 365), productCode: 'mtn_500mb_data_share' },
  { id: 'DATA_MTN_SHARE_1GB_30D', name: 'MTN 1GB Data share (30 Days)', category: 'VTU_DATA_SHARE', ...p(580, 590), productCode: 'mtn_1gb_data_share_30_days' },
  { id: 'DATA_MTN_SHARE_3GB_7D', name: 'MTN 3GB Data share (7 Days)', category: 'VTU_DATA_SHARE', ...p(1430, 1450), productCode: 'mtn_3gb_data_share_7_days' },
  { id: 'DATA_MTN_SHARE_2GB_7D', name: 'MTN 2GB Data share (7 Days)', category: 'VTU_DATA_SHARE', ...p(980, 999), productCode: 'mtn_2gb_data_share_7_days' },
  
  // --- VTU Data: Airtel SME ---
  { id: 'DATA_AIRTEL_SME_10GB_30D', name: 'Airtel SME 10GB (30 Days)', category: 'VTU_DATA_SME', ...p(3300, 3350), productCode: 'airtel_10gb30_days' },
  { id: 'DATA_AIRTEL_SME_1_5GB_7D', name: 'Airtel SME 1.5GB (7 Days)', category: 'VTU_DATA_SME', ...p(1080, 1100), productCode: 'airtel_1_5gb7_days' },
  { id: 'DATA_AIRTEL_SME_7GB_7D', name: 'Airtel SME 7GB (7 Days)', category: 'VTU_DATA_SME', ...p(2200, 2250), productCode: 'airtel_7gb7_days' },
  { id: 'DATA_AIRTEL_SME_10GB_7D', name: 'Airtel SME 10GB (7 Days)', category: 'VTU_DATA_SME', ...p(3250, 3300), productCode: 'airtel_10gb7_days' },
  { id: 'DATA_AIRTEL_SME_18GB_7D', name: 'Airtel SME 18GB (7 Days)', category: 'VTU_DATA_SME', ...p(5450, 5500), productCode: 'airtel_18gb7_days' },
  { id: 'DATA_AIRTEL_SME_600MB_2D', name: 'Airtel SME 600MB (2 Days)', category: 'VTU_DATA_SME', ...p(240, 245), productCode: 'airtel_600mb2_days' },
  { id: 'DATA_AIRTEL_SME_6GB_7D', name: 'Airtel SME 6GB (7 Days)', category: 'VTU_DATA_SME', ...p(2700, 2750), productCode: 'airtel_6gb7_days' },
  { id: 'DATA_AIRTEL_SME_1GB_1D_S', name: 'Airtel SME 1GB (1 Day) Special', category: 'VTU_DATA_SME', ...p(530, 540), productCode: 'airtel_1gb1_day_special' },
  { id: 'DATA_AIRTEL_SME_1_5GB_2D_S', name: 'Airtel SME 1.5GB (2 Days) Special', category: 'VTU_DATA_SME', ...p(660, 670), productCode: 'airtel_1_5gb2_days_special' },
  { id: 'DATA_AIRTEL_SME_2GB_2D_S', name: 'Airtel SME 2GB (2 Days) Special', category: 'VTU_DATA_SME', ...p(830, 850), productCode: 'airtel_2gb2_days_special' },
  { id: 'DATA_AIRTEL_SME_3GB_2D_S', name: 'Airtel SME 3GB (2 Days) Special', category: 'VTU_DATA_SME', ...p(1080, 1100), productCode: 'airtel_3gb2_days_special' },
  { id: 'DATA_AIRTEL_SME_3_5GB_7D', name: 'Airtel SME 3.5GB (7 Days)', category: 'VTU_DATA_SME', ...p(1580, 1600), productCode: 'airtel_3_5gb7_days' },
  { id: 'DATA_AIRTEL_SME_5GB_2D', name: 'Airtel SME 5GB (2 Days)', category: 'VTU_DATA_SME', ...p(1580, 1600), productCode: 'airtel_5gb2_days' },
  { id: 'DATA_AIRTEL_SME_200MB_2D', name: 'Airtel SME 200mb (2 Days)', category: 'VTU_DATA_SME', ...p(210, 220), productCode: 'airtel_200mb2_days' },
  { id: 'DATA_AIRTEL_SME_300MB_2D', name: 'Airtel SME 300mb (2 Days)', category: 'VTU_DATA_SME', ...p(125, 130), productCode: 'airtel_300mb2_days' },
  { id: 'DATA_AIRTEL_SME_150MB_1D', name: 'Airtel SME 150mb (1 Day)', category: 'VTU_DATA_SME', ...p(65, 66), productCode: 'airtel_150mb1_day' },
  { id: 'DATA_AIRTEL_SME_1_5GB_7D_S', name: 'Airtel SME 1.5GB (7 Days) Social', category: 'VTU_DATA_SME', ...p(525, 535), productCode: 'airtel_1_5gb7_days_social_bundle' },
  { id: 'DATA_AIRTEL_SME_1GB_3D_S', name: 'Airtel SME 1GB (3 Days) Social', category: 'VTU_DATA_SME', ...p(320, 325), productCode: 'airtel_1gb3_days_social_bundle' },
  { id: 'DATA_AIRTEL_SME_9GB_7D', name: 'Airtel SME 9GB (7 Days)', category: 'VTU_DATA_SME', ...p(2800, 2855), productCode: 'airtel_9gb7_days' },
  { id: 'DATA_AIRTEL_SME_1_5GB_1D', name: 'Airtel SME 1.5GB (1 Day)', category: 'VTU_DATA_SME', ...p(425, 435), productCode: 'airtel_1_5gb1_day' },
  { id: 'DATA_AIRTEL_SME_4GB_2D', name: 'Airtel SME 4GB (2 Days)', category: 'VTU_DATA_SME', ...p(880, 900), productCode: 'airtel_4gb2_days' },
  { id: 'DATA_AIRTEL_SME_13GB_30D', name: 'Airtel SME 13GB (30 Days)', category: 'VTU_DATA_SME', ...p(5900, 6000), productCode: 'airtel_13gb30_days' },
  { id: 'DATA_AIRTEL_SME_8GB_30D', name: 'Airtel SME 8gb (30 Days)', category: 'VTU_DATA_SME', ...p(2150, 2200), productCode: 'airtel_8gb30_days' },
  { id: 'DATA_AIRTEL_SME_60GB_60D', name: 'Airtel SME 60gb (60 Days)', category: 'VTU_DATA_SME', ...p(10800, 11000), productCode: 'airtel_60gb60_days' },

  // --- VTU Data: Glo Awoof ---
  { id: 'DATA_GLO_AWOOF_750MB_1D', name: 'Glo Awoof 750MB (1 Day)', category: 'VTU_DATA_AWOOF', ...p(180, 186), productCode: 'glo_750mb1_day' },
  { id: 'DATA_GLO_AWOOF_1_5GB_1D', name: 'Glo Awoof 1.5GB (1 Day)', category: 'VTU_DATA_AWOOF', ...p(270, 279), productCode: 'glo_1_5gb1_day' },
  { id: 'DATA_GLO_AWOOF_2_5GB_2D', name: 'Glo Awoof 2.5GB (2 Days)', category: 'VTU_DATA_AWOOF', ...p(450, 465), productCode: 'glo_2_5gb2_days' },
  { id: 'DATA_GLO_AWOOF_10GB_7D', name: 'Glo Awoof 10GB (7 Days)', category: 'VTU_DATA_AWOOF', ...p(1840, 1860), productCode: 'glo_10gb7_days' },

  // --- VTU Data: Mtn Awoof ---
  { id: 'DATA_MTN_AWOOF_1GB_1D', name: 'MTN Awoof 1GB (1 Day)', category: 'VTU_DATA_AWOOF', ...p(485, 495), productCode: 'mtn_1gb1_day_plan' },
  { id: 'DATA_MTN_AWOOF_3_2GB_2D', name: 'MTN Awoof 3.2GB (2 Days)', category: 'VTU_DATA_AWOOF', ...p(970, 990), productCode: 'mtn_3_2gb2_days_plan' },
  { id: 'DATA_MTN_AWOOF_2_5GB_2D', name: 'MTN Awoof 2.5GB (2 Days)', category: 'VTU_DATA_AWOOF', ...p(870, 891), productCode: 'mtn_2_5gb2_days' },
  { id: 'DATA_MTN_AWOOF_2GB_2D', name: 'MTN Awoof 2GB (2 Days)', category: 'VTU_DATA_AWOOF', ...p(730, 742.5), productCode: 'mtn_2gb2_days' },
  { id: 'DATA_MTN_AWOOF_750MB_3D', name: 'MTN Awoof 750MB (3 Days)', category: 'VTU_DATA_AWOOF', ...p(435, 445.5), productCode: 'mtn_750mb3_days' },
  { id: 'DATA_MTN_AWOOF_1GB_7D', name: 'MTN Awoof 1GB (7 Days)', category: 'VTU_DATA_AWOOF', ...p(780, 792), productCode: 'mtn_1gb7_days' },
  { id: 'DATA_MTN_AWOOF_1_5GB_7D', name: 'MTN Awoof 1.5GB (7 Days)', category: 'VTU_DATA_AWOOF', ...p(970, 990), productCode: 'mtn_1_5gb7_days' },
  { id: 'DATA_MTN_AWOOF_1_2GB_7D', name: 'MTN Awoof 1.2GB (7 Days)', category: 'VTU_DATA_AWOOF', ...p(730, 742.5), productCode: 'mtn_1_2gb7_days' },
  { id: 'DATA_MTN_AWOOF_6GB_7D', name: 'MTN Awoof 6GB (7 Days)', category: 'VTU_DATA_AWOOF', ...p(2450, 2475), productCode: 'mtn_6gb7_days' },
  { id: 'DATA_MTN_AWOOF_11GB_7D', name: 'MTN Awoof 11GB (7 Days)', category: 'VTU_DATA_AWOOF', ...p(3430, 3465), productCode: 'mtn_11gb7_days' },
  { id: 'DATA_MTN_AWOOF_110MB_1D', name: 'MTN Awoof 110MB (1 Day)', category: 'VTU_DATA_AWOOF', ...p(95, 99), productCode: 'mtn_110mb1_day' },
  { id: 'DATA_MTN_AWOOF_230MB_1D', name: 'MTN Awoof 230MB (1 Day)', category: 'VTU_DATA_AWOOF', ...p(190, 198), productCode: 'mtn_230mb1_day' },
  { id: 'DATA_MTN_AWOOF_500MB_7D', name: 'MTN Awoof 500MB (7 Days)', category: 'VTU_DATA_AWOOF', ...p(485, 495), productCode: 'mtn_500mb7_days' },
  { id: 'DATA_MTN_AWOOF_6_75GB_30D', name: 'MTN Awoof 6.75GB XTRA (30 Days)', category: 'VTU_DATA_AWOOF', ...p(2940, 2970), productCode: '6_75gb_xtra-special30_days' },
  { id: 'DATA_MTN_AWOOF_14_5GB_30D', name: 'MTN Awoof 14.5GB XTRA (30 Days)', category: 'VTU_DATA_AWOOF', ...p(4900, 4950), productCode: '14_5gb_xtra-special30_days' },
  { id: 'DATA_MTN_AWOOF_1_5GB_2D', name: 'MTN Awoof 1.5GB (2 Days)', category: 'VTU_DATA_AWOOF', ...p(580, 594), productCode: 'mtn_1_5gb2_days' },
  { id: 'DATA_MTN_AWOOF_1_8GB_30D', name: 'MTN Awoof 1.8GB Thryve (30 Days)', category: 'VTU_DATA_AWOOF', ...p(1460, 1485), productCode: '1_8gb_thryvedata30_days' },
  { id: 'DATA_MTN_AWOOF_1_2GB_30D_S', name: 'MTN Awoof 1.2GB Social (30 Days)', category: 'VTU_DATA_AWOOF', ...p(435, 445.5), productCode: 'mtn_1_2gb_all_social_30_days' },
  { id: 'DATA_MTN_AWOOF_20GB_7D', name: 'MTN Awoof 20GB (7 Days)', category: 'VTU_DATA_AWOOF', ...p(4900, 4950), productCode: 'mtn_20gb7_days' },
  { id: 'DATA_MTN_AWOOF_500MB_1D', name: 'MTN Awoof 500MB (1 Day)', category: 'VTU_DATA_AWOOF', ...p(340, 346.5), productCode: 'mtn_500mb1_day' },
  { id: 'DATA_MTN_AWOOF_2_5GB_1D', name: 'MTN Awoof 2.5GB (1 Day)', category: 'VTU_DATA_AWOOF', ...p(730, 742.5), productCode: 'mtn_2_5gb1_day' },
  { id: 'DATA_MTN_AWOOF_3_5GB_7D', name: 'MTN Awoof 3.5GB (7 Days)', category: 'VTU_DATA_AWOOF', ...p(1460, 1485), productCode: 'mtn_3_5gb7_days_plan' },

  // --- VTU Data: 9mobile Corporate ---
  { id: 'DATA_9M_CG_1GB_30D', name: '9Mobile CG 1GB (30 Days)', category: 'VTU_DATA_CG', ...p(290, 300), productCode: 'etisalat_cg_1gb_30days' },

  // --- VTU Data: Airtel SME Lite ---
  { id: 'DATA_AIRTEL_SME_LITE_1GB_7D', name: 'Airtel SME Lite 1GB (7 Days)', category: 'VTU_DATA_SME_LITE', ...p(770, 779), productCode: 'airtel_1gb7_days_lite' },
  { id: 'DATA_AIRTEL_SME_LITE_2GB_30D', name: 'Airtel SME Lite 2GB (30 Days)', category: 'VTU_DATA_SME_LITE', ...p(1540, 1558), productCode: 'airtel_2gb30_days_lite' },
  { id: 'DATA_AIRTEL_SME_LITE_3GB_30D', name: 'Airtel SME Lite 3GB (30 Days)', category: 'VTU_DATA_SME_LITE', ...p(2300, 2337), productCode: 'airtel_3gb30_days_lite' },
  { id: 'DATA_AIRTEL_SME_LITE_8GB_30D', name: 'Airtel SME Lite 8GB (30 Days)', category: 'VTU_DATA_SME_LITE', ...p(6200, 6232), productCode: 'airtel_8gb30_days_lite' },
  { id: 'DATA_AIRTEL_SME_LITE_10GB_30D', name: 'Airtel SME Lite 10GB (30 Days)', category: 'VTU_DATA_SME_LITE', ...p(7750, 7790), productCode: 'airtel_10gb30_days_lite' },

  // --- VTU Electricity ---
  { id: 'ELEC_AEDC_POST', name: 'AEDC PostPaid', category: 'VTU_ELEC', ...p(99, 100), productCode: 'aedc_postpaid_custom' },
  { id: 'ELEC_AEDC_PRE', name: 'AEDC PrePaid', category: 'VTU_ELEC', ...p(99, 100), productCode: 'aedc_prepaid_custom' },
  { id: 'ELEC_KNEDC_POST', name: 'Kaduna PostPaid', category: 'VTU_ELEC', ...p(99, 100), productCode: 'knedc_postpaid_custom' },
  { id: 'ELEC_KNEDC_PRE', name: 'Kaduna PrePaid', category: 'VTU_ELEC', ...p(99, 100), productCode: 'knedc_prepaid_custom' },
  { id: 'ELEC_KEDC_PRE', name: 'Kano PrePaid', category: 'VTU_ELEC', ...p(99, 100), productCode: 'kedc_prepaid_custom' },
  { id: 'ELEC_KEDC_POST', name: 'Kano PostPaid', category: 'VTU_ELEC', ...p(99, 100), productCode: 'kedc__postpaid_custom' },
  { id: 'ELEC_YEDC_POST', name: 'Yola PostPaid', category: 'VTU_ELEC', ...p(99, 100), productCode: 'yedc_postpaid_custom' },
  { id: 'ELEC_YEDC_PRE', name: 'Yola PrePaid', category: 'VTU_ELEC', ...p(99, 100), productCode: 'yedc_prepaid_custom' },
  { id: 'ELEC_PHED_POST', name: 'PH PostPaid', category: 'VTU_ELEC', ...p(99, 100), productCode: 'phed_postpaid_custom' },
  { id: 'ELEC_PHED_PRE', name: 'PH PrePaid', category: 'VTU_ELEC', ...p(99, 100), productCode: 'phed_prepaid_custom' },
  { id: 'ELEC_EEDC_POST', name: 'Enugu PostPaid', category: 'VTU_ELEC', ...p(99, 100), productCode: 'eedc_postpaid_custom' },
  { id: 'ELEC_EEDC_PRE', name: 'Enugu PrePaid', category: 'VTU_ELEC', ...p(99, 100), productCode: 'eedc_prepaid_custom' },
  { id: 'ELEC_BEDC_POST', name: 'Benin PostPaid', category: 'VTU_ELEC', ...p(99, 100), productCode: 'bedc_postpaid_custom' },
  { id: 'ELEC_BEDC_PRE', name: 'Benin PrePaid', category: 'VTU_ELEC', ...p(99, 100), productCode: 'bedc_prepaid_custom' },
  { id: 'ELEC_EKEDC_POST', name: 'Eko PostPaid', category: 'VTU_ELEC', ...p(99, 100), productCode: 'ekedc_postpaid_custom' },
  { id: 'ELEC_EKEDC_PRE', name: 'Eko PrePaid', category: 'VTU_ELEC', ...p(99, 100), productCode: 'ekedc_prepaid_custom' },
  { id: 'ELEC_IKEDC_POST', name: 'Ikeja PostPaid', category: 'VTU_ELEC', ...p(99, 100), productCode: 'ikedc_postpaid_custom' },
  { id: 'ELEC_IKEDC_PRE', name: 'Ikeja PrePaid', category: 'VTU_ELEC', ...p(99, 100), productCode: 'ikedc_prepaid_custom' },
  { id: 'ELEC_IBEDC_POST', name: 'Ibadan PostPaid', category: 'VTU_ELEC', ...p(99, 100), productCode: 'ibedc_postpaid_custom' },
  { id: 'ELEC_IBEDC_PRE', name: 'Ibadan PrePaid', category: 'VTU_ELEC', ...p(99, 100), productCode: 'ibedc_prepaid_custom' },
  { id: 'ELEC_JEDC_POST', name: 'Jos PostPaid', category: 'VTU_ELEC', ...p(99, 100), productCode: 'jedc_postpaid_custom' },
  { id: 'ELEC_JEDC_PRE', name: 'Jos PrePaid', category: 'VTU_ELEC', ...p(99, 100), productCode: 'jedc_prepaid_custom' },
];

async function main() {
  console.log('Start seeding services...');
  
  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: {
        name: service.name,
        category: service.category,
        platformPrice: service.platformPrice,
        defaultAgentPrice: service.defaultAgentPrice,
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
