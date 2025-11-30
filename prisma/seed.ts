import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// This list contains all services
const services = [
  // --- NIN Services ---
  { id: 'NIN_LOOKUP', name: 'NIN Verification Lookup', category: 'NIN', platformPrice: new Decimal(140.00), defaultAgentPrice: new Decimal(150.00), productCode: null },
  { id: 'NIN_SLIP_REGULAR', name: 'NIN Regular Slip', category: 'NIN', platformPrice: new Decimal(90.00), defaultAgentPrice: new Decimal(100.00), productCode: null },
  { id: 'NIN_SLIP_STANDARD', name: 'NIN Standard Slip', category: 'NIN', platformPrice: new Decimal(140.00), defaultAgentPrice: new Decimal(150.00), productCode: null },
  { id: 'NIN_SLIP_PREMIUM', name: 'NIN Premium Slip', category: 'NIN', platformPrice: new Decimal(180.00), defaultAgentPrice: new Decimal(200.00), productCode: null },
  { id: 'NIN_PERSONALIZATION', name: 'NIN Personalization', category: 'NIN', platformPrice: new Decimal(950.00), defaultAgentPrice: new Decimal(1000.00), productCode: null },
  { id: 'NIN_IPE_CLEARANCE', name: 'NIN IPE Clearance', category: 'NIN', platformPrice: new Decimal(2450.00), defaultAgentPrice: new Decimal(2500.00), productCode: null },
  { id: 'NIN_VALIDATION_47', name: 'NIN Validation (No Record)', category: 'NIN', platformPrice: new Decimal(480.00), defaultAgentPrice: new Decimal(500.00), productCode: null },
  { id: 'NIN_VALIDATION_48', name: 'NIN Validation (Sim Card Issues)', category: 'NIN', platformPrice: new Decimal(530.00), defaultAgentPrice: new Decimal(550.00), productCode: null },
  { id: 'NIN_VALIDATION_49', name: 'NIN Validation (Bank Validation)', category: 'NIN', platformPrice: new Decimal(480.00), defaultAgentPrice: new Decimal(500.00), productCode: null },
  { id: 'NIN_VALIDATION_50', name: 'NIN Validation (Photographer error)', category: 'NIN', platformPrice: new Decimal(580.00), defaultAgentPrice: new Decimal(600.00), productCode: null },
  { id: 'NIN_MOD_NAME', name: 'NIN Modification (Name)', category: 'NIN', platformPrice: new Decimal(1950.00), defaultAgentPrice: new Decimal(2000.00), productCode: null },
  { id: 'NIN_MOD_PHONE', name: 'NIN Modification (Phone)', category: 'NIN', platformPrice: new Decimal(950.00), defaultAgentPrice: new Decimal(1000.00), productCode: null },
  { id: 'NIN_MOD_ADDRESS', name: 'NIN Modification (Address)', category: 'NIN', platformPrice: new Decimal(1450.00), defaultAgentPrice: new Decimal(1500.00), productCode: null },
  { id: 'NIN_MOD_DOB', name: 'NIN Modification (Date of Birth)', category: 'NIN', platformPrice: new Decimal(14500.00), defaultAgentPrice: new Decimal(15000.00), productCode: null },
  { id: 'NIN_DELINK', name: 'NIN Delink / Retrieve Email', category: 'NIN', platformPrice: new Decimal(2450.00), defaultAgentPrice: new Decimal(2500.00), productCode: null },
  
  // --- NEW: VNIN Slip ---
  { id: 'VNIN_SLIP', name: 'VNIN Slip (Instant)', category: 'NIN', platformPrice: new Decimal(150.00), defaultAgentPrice: new Decimal(200.00), productCode: null }, 
  // ---------------------

  // --- Newspaper Services ---
  { id: 'NEWSPAPER_NAME_CHANGE', name: 'Newspaper Change of Name', category: 'NEWSPAPER', platformPrice: new Decimal(4450.00), defaultAgentPrice: new Decimal(4500.00), productCode: null },
  
  // --- CAC Services ---
  { id: 'CAC_REG_BN', name: 'CAC Business Name Registration', category: 'CAC', platformPrice: new Decimal(17500.00), defaultAgentPrice: new Decimal(18000.00), productCode: null },
  { id: 'CAC_DOC_RETRIEVAL', name: 'CAC Document Retrieval', category: 'CAC', platformPrice: new Decimal(4800.00), defaultAgentPrice: new Decimal(5000.00), productCode: null },

  // --- TIN Services ---
  { id: 'TIN_REG_PERSONAL', name: 'TIN Registration (Personal)', category: 'TIN', platformPrice: new Decimal(2800.00), defaultAgentPrice: new Decimal(3000.00), productCode: null },
  { id: 'TIN_REG_BUSINESS', name: 'TIN Registration (Business)', category: 'TIN', platformPrice: new Decimal(4800.00), defaultAgentPrice: new Decimal(5000.00), productCode: null },
  { id: 'TIN_RETRIEVAL_PERSONAL', name: 'TIN Retrieval (Personal)', category: 'TIN', platformPrice: new Decimal(1400.00), defaultAgentPrice: new Decimal(1500.00), productCode: null },
  { id: 'TIN_RETRIEVAL_BUSINESS', name: 'TIN Retrieval (Business)', category: 'TIN', platformPrice: new Decimal(2400.00), defaultAgentPrice: new Decimal(2500.00), productCode: null },

  // --- Exam Pin (Automated) ---
  { id: 'WAEC_PIN', name: 'WAEC Result Pin', category: 'EXAM_PINS', platformPrice: new Decimal(3550.00), defaultAgentPrice: new Decimal(3600.00), productCode: 'waec_pin' },
  { id: 'NECO_PIN', name: 'NECO Result Pin', category: 'EXAM_PINS', platformPrice: new Decimal(1300.00), defaultAgentPrice: new Decimal(1350.00), productCode: 'neco_pin' },
  { id: 'NABTEB_PIN', name: 'NABTEB Result Pin', category: 'EXAM_PINS', platformPrice: new Decimal(1000.00), defaultAgentPrice: new Decimal(1050.00), productCode: 'nabteb_pin' },
  { id: 'JAMB_UTME_PIN', name: 'JAMB UTME Pin', category: 'EXAM_PINS', platformPrice: new Decimal(480.00), defaultAgentPrice: new Decimal(500.00), productCode: 'utme_pin' },
  { id: 'JAMB_DE_PIN', name: 'JAMB Direct Entry (DE) Pin', category: 'EXAM_PINS', platformPrice: new Decimal(480.00), defaultAgentPrice: new Decimal(500.00), productCode: 'direct_entry_de' },

  // --- Exam Result (Manual) ---
  { id: 'RESULT_REQUEST_WAEC', name: 'WAEC Result Request (Manual)', category: 'EXAM_PINS', platformPrice: new Decimal(950.00), defaultAgentPrice: new Decimal(1000.00), productCode: null },
  { id: 'RESULT_REQUEST_NECO', name: 'NECO Result Request (Manual)', category: 'EXAM_PINS', platformPrice: new Decimal(950.00), defaultAgentPrice: new Decimal(1000.00), productCode: null },
  { id: 'RESULT_REQUEST_NABTEB', name: 'NABTEB Result Request (Manual)', category: 'EXAM_PINS', platformPrice: new Decimal(950.00), defaultAgentPrice: new Decimal(1000.00), productCode: null },
  
  // --- JAMB Slip Services (Manual) ---
  { id: 'JAMB_RESULT_SLIP', name: 'JAMB Result Slip', category: 'JAMB', platformPrice: new Decimal(1400.00), defaultAgentPrice: new Decimal(1500.00), productCode: null },
  { id: 'JAMB_REG_SLIP', name: 'JAMB Registration Slip', category: 'JAMB', platformPrice: new Decimal(1400.00), defaultAgentPrice: new Decimal(1500.00), productCode: null },
  { id: 'JAMB_ADMISSION_LETTER', name: 'JAMB Admission Letter', category: 'JAMB', platformPrice: new Decimal(1400.00), defaultAgentPrice: new Decimal(1500.00), productCode: null },
  { id: 'JAMB_PROFILE_CODE', name: 'JAMB Profile Code Retrieval', category: 'JAMB', platformPrice: new Decimal(400.00), defaultAgentPrice: new Decimal(500.00), productCode: null },

  // --- "World-Class" VTU ---

  // --- VTU Airtime ---
  { id: 'AIRTIME_MTN', name: 'MTN Airtime', category: 'VTU_AIRTIME', platformPrice: new Decimal(97.00), defaultAgentPrice: new Decimal(98.00), productCode: 'mtn_custom' },
  { id: 'AIRTIME_GLO', name: 'Glo Airtime', category: 'VTU_AIRTIME', platformPrice: new Decimal(97.00), defaultAgentPrice: new Decimal(98.00), productCode: 'glo_custom' },
  { id: 'AIRTIME_AIRTEL', name: 'Airtel Airtime', category: 'VTU_AIRTIME', platformPrice: new Decimal(97.00), defaultAgentPrice: new Decimal(98.00), productCode: 'airtel_custom' },
  { id: 'AIRTIME_9MOBILE', name: '9Mobile Airtime', category: 'VTU_AIRTIME', platformPrice: new Decimal(97.00), defaultAgentPrice: new Decimal(98.00), productCode: 'etisalat_custom' },

  // --- VTU Data: MTN (direct data) ---
  { id: 'DATA_MTN_GIFT_17GB_30D', name: 'MTN 17GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(5000), defaultAgentPrice: new Decimal(5000), productCode: 'mtn_17gb30days' },
  { id: 'DATA_MTN_GIFT_250GB_90D', name: 'MTN 250GB (90 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(50000), defaultAgentPrice: new Decimal(50000), productCode: 'mtn_250gb_90days' },
  { id: 'DATA_MTN_GIFT_20GB_30D_A', name: 'MTN 20GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(6000), defaultAgentPrice: new Decimal(6000), productCode: 'mtn_20gb30days' },
  { id: 'DATA_MTN_GIFT_120GB_30D', name: 'MTN 120GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(20000), defaultAgentPrice: new Decimal(20000), productCode: 'mtn_120gb30days' },
  { id: 'DATA_MTN_GIFT_30GB_60D', name: 'MTN 30GB (60 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(10000), defaultAgentPrice: new Decimal(10000), productCode: 'mtn_30gb60days' },
  { id: 'DATA_MTN_GIFT_25GB_30D_A', name: 'MTN 25GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(8000), defaultAgentPrice: new Decimal(8000), productCode: 'mtn_25gb30days' },
  { id: 'DATA_MTN_GIFT_1TB_365D', name: 'MTN 1TB (365 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(150000), defaultAgentPrice: new Decimal(150000), productCode: 'mtn_1tb365days' },
  { id: 'DATA_MTN_GIFT_200GB_30D', name: 'MTN 200GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(30000), defaultAgentPrice: new Decimal(30000), productCode: 'mtn_200gb30days' },
  { id: 'DATA_MTN_GIFT_100GB_60D', name: 'MTN 100GB (60 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(25000), defaultAgentPrice: new Decimal(25000), productCode: 'mtn_100gb60days' },
  { id: 'DATA_MTN_GIFT_160GB_60D', name: 'MTN 160GB (60 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(35000), defaultAgentPrice: new Decimal(35000), productCode: 'mtn_160gb60days' },
  { id: 'DATA_MTN_GIFT_1GB_1D', name: 'MTN 1GB (1 Day)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(500), defaultAgentPrice: new Decimal(500), productCode: 'mtn_1gb1_day' },
  { id: 'DATA_MTN_GIFT_3_5GB_2D', name: 'MTN 3.5GB (2 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(1000), defaultAgentPrice: new Decimal(1000), productCode: 'mtn_3_5gb2_days' },
  { id: 'DATA_MTN_GIFT_15GB_7D', name: 'MTN 15GB (7 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(3000), defaultAgentPrice: new Decimal(3000), productCode: 'mtn_15gb7_days' },
  { id: 'DATA_MTN_GIFT_10GB_30D_B', name: 'MTN 10GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(4477.5), defaultAgentPrice: new Decimal(4500), productCode: 'mtn_10gb_30days' },
  { id: 'DATA_MTN_GIFT_2_7GB_30D_B', name: 'MTN 2.7GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(1990), defaultAgentPrice: new Decimal(2000), productCode: 'mtn_2_7gb_30days' },
  { id: 'DATA_MTN_GIFT_20GB_30D_B', name: 'MTN 20GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(7462.5), defaultAgentPrice: new Decimal(7500), productCode: 'mtn_20gb_30days' },
  { id: 'DATA_MTN_GIFT_25GB_30D_B', name: 'MTN 25GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(8955), defaultAgentPrice: new Decimal(9000), productCode: 'mtn_25gb_30days' },
  { id: 'DATA_MTN_GIFT_75GB_30D_B', name: 'MTN 75GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(17910), defaultAgentPrice: new Decimal(18000), productCode: 'mtn_75gb_30days' },
  { id: 'DATA_MTN_GIFT_250GB_30D_B', name: 'MTN 250GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(54725), defaultAgentPrice: new Decimal(54800), productCode: 'mtn_250gb_30days' },
  { id: 'DATA_MTN_GIFT_90GB_60D_B', name: 'MTN 90GB (60 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(24875), defaultAgentPrice: new Decimal(24900), productCode: 'mtn_90gb_60days' },
  { id: 'DATA_MTN_GIFT_200GB_60D_B', name: 'MTN 200GB (60 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(49750), defaultAgentPrice: new Decimal(49800), productCode: 'mtn_200gb_60days' },
  { id: 'DATA_MTN_GIFT_150GB_60D_B', name: 'MTN 150GB (60 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(39800), defaultAgentPrice: new Decimal(39900), productCode: 'mtn_150gb_60days' },
  { id: 'DATA_MTN_GIFT_2GB_30D_B', name: 'MTN 2GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(1492.5), defaultAgentPrice: new Decimal(1500), productCode: 'mtn_2gb_30days' },
  { id: 'DATA_MTN_GIFT_3_5GB_30D_B', name: 'MTN 3.5GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(2487.5), defaultAgentPrice: new Decimal(2500), productCode: 'mtn_3_5gb_30days' },
  { id: 'DATA_MTN_GIFT_12_5GB_30D_B', name: 'MTN 12.5GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(5472.5), defaultAgentPrice: new Decimal(5500), productCode: 'mtn_12_5gb_30days' },
  { id: 'DATA_MTN_GIFT_16_5GB_30D_B', name: 'MTN 16.5GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(6467.5), defaultAgentPrice: new Decimal(6500), productCode: 'mtn_16_5gb_30days' },
  { id: 'DATA_MTN_GIFT_36GB_30D_B', name: 'MTN 36GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(10945), defaultAgentPrice: new Decimal(11000), productCode: 'mtn_36gb_30days' },
  { id: 'DATA_MTN_GIFT_165GB_30D_B', name: 'MTN 165GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(34825), defaultAgentPrice: new Decimal(34900), productCode: 'mtn_165gb_30days' },
  { id: 'DATA_MTN_GIFT_7GB_30D_B', name: 'MTN 7GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(3482.5), defaultAgentPrice: new Decimal(3500), productCode: 'mtn_7gb_30days' },
  { id: 'DATA_MTN_GIFT_800GB_365D_B', name: 'MTN 800GB (365 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(124375), defaultAgentPrice: new Decimal(124500), productCode: 'mtn_800gb_365_days' },

  // --- VTU Data: Glo Direct Gifting ---
  { id: 'DATA_GLO_GIFT_2_6GB_30D', name: 'Glo 2.6GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(920), defaultAgentPrice: new Decimal(930), productCode: 'glo_2_6gb30days' },
  { id: 'DATA_GLO_GIFT_5GB_30D', name: 'Glo 5GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(1380), defaultAgentPrice: new Decimal(1395), productCode: 'glo_5gb30days' },
  { id: 'DATA_GLO_GIFT_6_15GB_30D', name: 'Glo 6.15GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(1840), defaultAgentPrice: new Decimal(1860), productCode: 'glo_6_15gb30days' },
  { id: 'DATA_GLO_GIFT_7_25GB_30D', name: 'Glo 7.25GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(2300), defaultAgentPrice: new Decimal(2325), productCode: 'glo_7_25gb30days' },
  { id: 'DATA_GLO_GIFT_10GB_30D', name: 'Glo 10GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(2760), defaultAgentPrice: new Decimal(2790), productCode: 'glo_10gb30days' },
  { id: 'DATA_GLO_GIFT_12_5GB_30D', name: 'Glo 12.5GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(3690), defaultAgentPrice: new Decimal(3720), productCode: 'glo_12_5gb30days' },
  { id: 'DATA_GLO_GIFT_16GB_30D', name: 'Glo 16GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(4620), defaultAgentPrice: new Decimal(4650), productCode: 'glo_16gb30days' },
  { id: 'DATA_GLO_GIFT_28GB_30D', name: 'Glo 28GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(7400), defaultAgentPrice: new Decimal(7440), productCode: 'glo_28gb30days' },
  { id: 'DATA_GLO_GIFT_38GB_30D', name: 'Glo 38GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(9250), defaultAgentPrice: new Decimal(9300), productCode: 'glo_38gb30days' },
  { id: 'DATA_GLO_GIFT_64GB_30D', name: 'Glo 64GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(13900), defaultAgentPrice: new Decimal(13950), productCode: 'glo_64gb30days' },
  { id: 'DATA_GLO_GIFT_107GB_30D', name: 'Glo 107GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(18500), defaultAgentPrice: new Decimal(18600), productCode: 'glo_107gb30days' },
  { id: 'DATA_GLO_GIFT_135GB_30D', name: 'Glo 135GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(23150), defaultAgentPrice: new Decimal(23250), productCode: 'glo_135gb30days' },
  { id: 'DATA_GLO_GIFT_165GB_30D', name: 'Glo 165GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(27800), defaultAgentPrice: new Decimal(27900), productCode: 'glo_165gb30days' },
  { id: 'DATA_GLO_GIFT_220GB_30D', name: 'Glo 220GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(37100), defaultAgentPrice: new Decimal(37200), productCode: 'glo_220gb30days' },
  { id: 'DATA_GLO_GIFT_310GB_60D', name: 'Glo 310GB (60 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(46400), defaultAgentPrice: new Decimal(46500), productCode: 'glo_310gb60days' },
  { id: 'DATA_GLO_GIFT_380GB_90D', name: 'Glo 380GB (90 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(55700), defaultAgentPrice: new Decimal(55800), productCode: 'glo_380gb90days' },
  { id: 'DATA_GLO_GIFT_475GB_90D', name: 'Glo 475GB (90 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(69650), defaultAgentPrice: new Decimal(69750), productCode: 'glo_475gb90days' },
  { id: 'DATA_GLO_GIFT_1TB_365D', name: 'Glo 1TB (365 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(139400), defaultAgentPrice: new Decimal(139500), productCode: 'glo_1tb365days' },

  // --- VTU Data: Airtel Direct Gifting ---
  { id: 'DATA_AIRTEL_GIFT_2GB_30D', name: 'Airtel 2GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(1450), defaultAgentPrice: new Decimal(1470), productCode: 'airtel_2gb30days' },
  { id: 'DATA_AIRTEL_GIFT_3GB_30D', name: 'Airtel 3GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(1940), defaultAgentPrice: new Decimal(1960), productCode: 'airtel_3gb30days' },
  { id: 'DATA_AIRTEL_GIFT_10GB_30D', name: 'Airtel 10GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(3900), defaultAgentPrice: new Decimal(3920), productCode: 'airtel_10gb30days' },
  { id: 'DATA_AIRTEL_GIFT_1GB_7D', name: 'Airtel 1GB (7 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(770), defaultAgentPrice: new Decimal(784), productCode: 'airtel_1gb7_days' },
  { id: 'DATA_AIRTEL_GIFT_500MB_7D', name: 'Airtel 500mb (7 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(480), defaultAgentPrice: new Decimal(490), productCode: 'airtel_500mb7_days' },
  { id: 'DATA_AIRTEL_GIFT_4GB_30D', name: 'Airtel 4GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(2430), defaultAgentPrice: new Decimal(2450), productCode: 'airtel_4gb30days' },
  { id: 'DATA_AIRTEL_GIFT_8GB_30D', name: 'Airtel 8GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(2910), defaultAgentPrice: new Decimal(2940), productCode: 'airtel_8gb30days' },
  { id: 'DATA_AIRTEL_GIFT_13GB_30D', name: 'Airtel 13GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(4850), defaultAgentPrice: new Decimal(4900), productCode: 'airtel_13gb30days' },
  { id: 'DATA_AIRTEL_GIFT_18GB_30D', name: 'Airtel 18GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(5830), defaultAgentPrice: new Decimal(5880), productCode: 'airtel_18gb30days' },
  { id: 'DATA_AIRTEL_GIFT_25GB_30D', name: 'Airtel 25GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(7800), defaultAgentPrice: new Decimal(7840), productCode: 'airtel_25gb30days' },
  { id: 'DATA_AIRTEL_GIFT_35GB_30D', name: 'Airtel 35GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(9750), defaultAgentPrice: new Decimal(9800), productCode: 'airtel_35gb30days' },
  { id: 'DATA_AIRTEL_GIFT_60GB_30D', name: 'Airtel 60GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(14600), defaultAgentPrice: new Decimal(14700), productCode: 'airtel_60gb30days' },
  { id: 'DATA_AIRTEL_GIFT_100GB_30D', name: 'Airtel 100GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(19500), defaultAgentPrice: new Decimal(19600), productCode: 'airtel_100gb30days' },
  { id: 'DATA_AIRTEL_GIFT_160GB_30D', name: 'Airtel 160GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(29300), defaultAgentPrice: new Decimal(29400), productCode: 'airtel_160gb30days' },
  { id: 'DATA_AIRTEL_GIFT_210GB_30D', name: 'Airtel 210GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(39100), defaultAgentPrice: new Decimal(39200), productCode: 'airtel_210gb30days' },
  { id: 'DATA_AIRTEL_GIFT_300GB_90D', name: 'Airtel 300GB (90 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(48900), defaultAgentPrice: new Decimal(49000), productCode: 'airtel_300gb90days' },
  { id: 'DATA_AIRTEL_GIFT_650GB_365D', name: 'Airtel 650GB (365 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(97900), defaultAgentPrice: new Decimal(98000), productCode: 'airtel_650gb365days' },

  // --- VTU Data: 9mobile Direct Gifting ---
  { id: 'DATA_9M_GIFT_2GB_30D', name: '9Mobile 2GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(1480), defaultAgentPrice: new Decimal(1500), productCode: 'etisalat_2gb30days' },
  { id: 'DATA_9M_GIFT_4_5GB_30D', name: '9Mobile 4.5GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(1980), defaultAgentPrice: new Decimal(2000), productCode: 'etisalat_4_5gb30days' },
  { id: 'DATA_9M_GIFT_11GB_30D', name: '9Mobile 11GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(3950), defaultAgentPrice: new Decimal(4000), productCode: 'etisalat_11gb30days' },
  { id: 'DATA_9M_GIFT_75GB_30D', name: '9Mobile 75GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(14900), defaultAgentPrice: new Decimal(15000), productCode: 'etisalat_75gb30days' },
  { id: 'DATA_9M_GIFT_1_5GB_30D', name: '9Mobile 1.5GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(1180), defaultAgentPrice: new Decimal(1200), productCode: 'etisalat_1_5gb30days' },
  { id: 'DATA_9M_GIFT_40GB_30D', name: '9Mobile 40GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(9900), defaultAgentPrice: new Decimal(10000), productCode: 'etisalat_40gb30days' },
  { id: 'DATA_9M_GIFT_3GB_30D', name: '9Mobile 3GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(1780), defaultAgentPrice: new Decimal(1800), productCode: 'etisalat_3gb30days' },
  { id: 'DATA_9M_GIFT_15GB_30D', name: '9Mobile 15GB (30 Days)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(4950), defaultAgentPrice: new Decimal(5000), productCode: 'etisalat_15gb30days' },
  { id: 'DATA_9M_GIFT_75GB_3M', name: '9Mobile 75GB (3 Months)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(24900), defaultAgentPrice: new Decimal(25000), productCode: 'etisalat_75gb3_months' },
  { id: 'DATA_9M_GIFT_165GB_6M', name: '9Mobile 165GB (6 Months)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(49800), defaultAgentPrice: new Decimal(50000), productCode: 'etisalat_165gb6_months' },
  { id: 'DATA_9M_GIFT_365GB_1Y', name: '9Mobile 365GB (1 Year)', category: 'VTU_DATA_GIFTING', platformPrice: new Decimal(99800), defaultAgentPrice: new Decimal(100000), productCode: 'etisalat_365gb1_year' },

  // --- VTU Data: Glo Cloud Data ---
  { id: 'DATA_GLO_CLOUD_50MB_1D_A', name: 'Glo Cloud 50MB (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(50), defaultAgentPrice: new Decimal(50), productCode: 'glo_cloud_50mb_incl_5mb_nite1day' },
  { id: 'DATA_GLO_CLOUD_350MB_2D_A', name: 'Glo Cloud 350MB (2 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(100), defaultAgentPrice: new Decimal(100), productCode: 'glo_cloud_350mb_incl_110mb_nite2days' },
  { id: 'DATA_GLO_CLOUD_1_8GB_14D_A', name: 'Glo Cloud 1.8GB (14 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(500), defaultAgentPrice: new Decimal(500), productCode: 'glo_cloud_1_8gb_incl_1gb_nite14days' },
  { id: 'DATA_GLO_CLOUD_150MB_1D_A', name: 'Glo Cloud 150MB (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(100), defaultAgentPrice: new Decimal(100), productCode: 'glo_cloud_150mb_incl_35mb_nite1day' },
  { id: 'DATA_GLO_CLOUD_250MB_N_1D_A', name: 'Glo Cloud 250MB Night (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(50), defaultAgentPrice: new Decimal(50), productCode: 'glo_cloud_250mb_night1day' },
  { id: 'DATA_GLO_CLOUD_7GB_S_7D_A', name: 'Glo Cloud 7GB Special (7 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(1500), defaultAgentPrice: new Decimal(1500), productCode: 'glo_cloud_7gb_special7days' },
  { id: 'DATA_GLO_CLOUD_100MB_WTF_1D', name: 'Glo Cloud 100MB WTF (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(100), defaultAgentPrice: new Decimal(100), productCode: 'glo_cloud_100mb_wtf1day' },
  { id: 'DATA_GLO_CLOUD_200MB_WTF_7D', name: 'Glo Cloud 200MB WTF (7 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(200), defaultAgentPrice: new Decimal(200), productCode: 'glo_cloud_200mb_wtf7days' },
  { id: 'DATA_GLO_CLOUD_500MB_WTF_30D', name: 'Glo Cloud 500MB WTF (30 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(500), defaultAgentPrice: new Decimal(500), productCode: 'glo_cloud_500mb_wtf30days' },
  { id: 'DATA_GLO_CLOUD_20MB_TEL_1D', name: 'Glo Cloud 20MB Telegram (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(25), defaultAgentPrice: new Decimal(25), productCode: 'glo_cloud_20mb_telegram1day' },
  { id: 'DATA_GLO_CLOUD_50MB_TEL_7D', name: 'Glo Cloud 50MB Telegram (7 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(50), defaultAgentPrice: new Decimal(50), productCode: 'glo_cloud_50mb_telegram7days' },
  { id: 'DATA_GLO_CLOUD_125MB_TEL_30D', name: 'Glo Cloud 125MB Telegram (30 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(100), defaultAgentPrice: new Decimal(100), productCode: 'glo_cloud_125mb_telegram30days' },
  { id: 'DATA_GLO_CLOUD_20MB_INSTA_1D', name: 'Glo Cloud 20MB Instagram (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(25), defaultAgentPrice: new Decimal(25), productCode: 'glo_cloud_20mb_instagram1day' },
  { id: 'DATA_GLO_CLOUD_50MB_INSTA_7D', name: 'Glo Cloud 50MB Instagram (7 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(50), defaultAgentPrice: new Decimal(50), productCode: 'glo_cloud_50mb_instagram7days' },
  { id: 'DATA_GLO_CLOUD_125MB_INSTA_30D', name: 'Glo Cloud 125MB Instagram (30 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(100), defaultAgentPrice: new Decimal(100), productCode: 'glo_cloud125mb_instagram30days' },
  { id: 'DATA_GLO_CLOUD_20MB_TIKTOK_1D', name: 'Glo Cloud 20MB Tiktok (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(25), defaultAgentPrice: new Decimal(25), productCode: 'glo_cloud_20mb_tiktok1day' },
  { id: 'DATA_GLO_CLOUD_50MB_TIKTOK_7D', name: 'Glo Cloud 50MB Tiktok (7 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(50), defaultAgentPrice: new Decimal(50), productCode: 'glo_cloud_50mb_tiktok7days' },
  { id: 'DATA_GLO_CLOUD_125MB_TIKTOK_30D', name: 'Glo Cloud 125MB Tiktok (30 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(100), defaultAgentPrice: new Decimal(100), productCode: 'glo_cloud_125mb_tiktok30days' },
  { id: 'DATA_GLO_CLOUD_20MB_OPERA_1D', name: 'Glo Cloud 20MB Opera (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(25), defaultAgentPrice: new Decimal(25), productCode: 'glo_cloud_20mb_opera1day' },
  { id: 'DATA_GLO_CLOUD_100MB_OPERA_7D', name: 'Glo Cloud 100MB Opera (7 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(50), defaultAgentPrice: new Decimal(50), productCode: 'glo_cloud_100mb_opera7days' },
  { id: 'DATA_GLO_CLOUD_300MB_OPERA_30D', name: 'Glo Cloud 300MB Opera (30 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(100), defaultAgentPrice: new Decimal(100), productCode: 'glo_cloud_300mb_opera30days' },
  { id: 'DATA_GLO_CLOUD_100MB_YT_1D', name: 'Glo Cloud 100MB Youtube (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(50), defaultAgentPrice: new Decimal(50), productCode: 'glo_cloud_100mb_youtube1day' },
  { id: 'DATA_GLO_CLOUD_200MB_YT_7D', name: 'Glo Cloud 200MB Youtube (7 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(100), defaultAgentPrice: new Decimal(100), productCode: 'glo_cloud_200mb_youtube7days' },
  { id: 'DATA_GLO_CLOUD_500MB_YT_30D', name: 'Glo Cloud 500MB Youtube (30 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(250), defaultAgentPrice: new Decimal(250), productCode: 'glo_cloud_500mb_youtube30days' },
  { id: 'DATA_GLO_CLOUD_3_9GB_N_30D', name: 'Glo Cloud 3.9GB (30 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(1000), defaultAgentPrice: new Decimal(1000), productCode: 'glo_cloud_3_9gb_incl_2gb_nite30days' },
  { id: 'DATA_GLO_CLOUD_7_5GB_N_30D', name: 'Glo Cloud 7.5GB (30 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(1500), defaultAgentPrice: new Decimal(1500), productCode: 'glo_cloud_7_5gb_incl_4gb_nite30days' },
  { id: 'DATA_GLO_CLOUD_9_2GB_N_30D', name: 'Glo Cloud 9.2GB (30 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(2000), defaultAgentPrice: new Decimal(2000), productCode: 'glo_cloud_9_2gb_incl_4gb_nite30days' },
  { id: 'DATA_GLO_CLOUD_500MB_N_1D', name: 'Glo Cloud 500MB Night (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(100), defaultAgentPrice: new Decimal(100), productCode: 'glo_cloud_500mb_night1day' },
  { id: 'DATA_GLO_CLOUD_1GB_N_1D', name: 'Glo Cloud 1GB Night (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(150), defaultAgentPrice: new Decimal(150), productCode: 'glo_cloud_1gb_night1day' },
  { id: 'DATA_GLO_CLOUD_20MB_WC_1D', name: 'Glo Cloud 20MB Wechat (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(25), defaultAgentPrice: new Decimal(25), productCode: 'glo_cloud_20mb_wechat1day' },
  { id: 'DATA_GLO_CLOUD_50MB_WC_7D', name: 'Glo Cloud 50MB Wechat (7 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(50), defaultAgentPrice: new Decimal(50), productCode: 'glo_cloud_50mb_wechat7days' },
  { id: 'DATA_GLO_CLOUD_125MB_WC_30D', name: 'Glo Cloud 125MB Wechat (30 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(100), defaultAgentPrice: new Decimal(100), productCode: 'glo_cloud_125mb_wechat30days' },
  { id: 'DATA_GLO_CLOUD_20MB_ESK_1D', name: 'Glo Cloud 20MB Eskimi (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(25), defaultAgentPrice: new Decimal(25), productCode: 'glo_cloud_20mb_eskimi1day' },
  { id: 'DATA_GLO_CLOUD_50MB_ESK_7D', name: 'Glo Cloud 50MB Eskimi (7 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(50), defaultAgentPrice: new Decimal(50), productCode: 'glo_cloud_50mb_eskimi7days' },
  { id: 'DATA_GLO_CLOUD_125MB_ESK_30D', name: 'Glo Cloud 125MB Eskimi (30 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(100), defaultAgentPrice: new Decimal(100), productCode: 'glo_cloud_125mb_eskimi30days' },
  { id: 'DATA_GLO_CLOUD_25MB_OPERA_1D', name: 'Glo Cloud 25MB Opera (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(25), defaultAgentPrice: new Decimal(25), productCode: 'glo_cloud_25mb_opera1day' },
  { id: 'DATA_GLO_CLOUD_50MB_YT_1D', name: 'Glo Cloud 50MB Youtube (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(50), defaultAgentPrice: new Decimal(50), productCode: 'glo_cloud_50mb_youtube1day' },
  { id: 'DATA_GLO_CLOUD_100MB_YT_7D', name: 'Glo Cloud 100MB Youtube (7 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(100), defaultAgentPrice: new Decimal(100), productCode: 'glo_cloud_100mb_youtube7days' },
  { id: 'DATA_GLO_CLOUD_1_25GB_SUN_1D', name: 'Glo Cloud 1.25GB Sunday (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(200), defaultAgentPrice: new Decimal(200), productCode: 'glo_cloud_1_25gb_sunday1day' },
  { id: 'DATA_GLO_CLOUD_50MB_1D_B', name: 'Glo Cloud 50MB (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(50), defaultAgentPrice: new Decimal(50), productCode: 'glo_cloud_50mb1day' },
  { id: 'DATA_GLO_CLOUD_150MB_1D_B', name: 'Glo Cloud 150MB (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(100), defaultAgentPrice: new Decimal(100), productCode: 'glo_cloud_150mb1day' },
  { id: 'DATA_GLO_CLOUD_350MB_2D_B', name: 'Glo Cloud 350MB (2 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(200), defaultAgentPrice: new Decimal(200), productCode: 'glo_cloud_350mb2days' },
  { id: 'DATA_GLO_CLOUD_1GB_14D_B', name: 'Glo Cloud 1GB (14 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(500), defaultAgentPrice: new Decimal(500), productCode: 'glo_cloud_1gb14days' },
  { id: 'DATA_GLO_CLOUD_3_9GB_30D_B', name: 'Glo Cloud 3.9GB (30 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(1000), defaultAgentPrice: new Decimal(1000), productCode: 'glo_cloud_3_9gb30days' },
  { id: 'DATA_GLO_CLOUD_4_1GB_30D_B', name: 'Glo Cloud 4.1GB (30 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(1000), defaultAgentPrice: new Decimal(1000), productCode: 'glo_cloud_4_1gb30days' },
  { id: 'DATA_GLO_CLOUD_5_8GB_30D_B', name: 'Glo Cloud 5.8GB (30 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(1500), defaultAgentPrice: new Decimal(1500), productCode: 'glo_cloud_5_8gb30days' },
  { id: 'DATA_GLO_CLOUD_1_35GB_14D_B', name: 'Glo Cloud 1.35GB (14 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(500), defaultAgentPrice: new Decimal(500), productCode: 'glo_cloud_1_35gb14days' },
  { id: 'DATA_GLO_CLOUD_50MB_YT_T_1D', name: 'Glo Cloud 50MB Youtube Time (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(50), defaultAgentPrice: new Decimal(50), productCode: 'glo_cloud_50mb_youtube_50_time1day' },
  { id: 'DATA_GLO_CLOUD_1_5GB_YT_T_1D', name: 'Glo Cloud 1.5GB Youtube Time (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(130), defaultAgentPrice: new Decimal(130), productCode: 'glo_cloud_1_5gb_youtube_130_time1day' },
  { id: 'DATA_GLO_CLOUD_500MB_YT_N_1D', name: 'Glo Cloud 500MB Youtube Night (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(50), defaultAgentPrice: new Decimal(50), productCode: 'glo_cloud_500mb_youtube_50_night_time1day' },
  { id: 'DATA_GLO_CLOUD_2GB_YT_N_7D', name: 'Glo Cloud 2GB Youtube Night (7 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(200), defaultAgentPrice: new Decimal(200), productCode: 'glo_cloud_2gb_youtube_200_night_time7days' },
  { id: 'DATA_GLO_CLOUD_500MB_YT_T_O_1D', name: 'Glo Cloud 500MB Youtube Time Oneoff (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(50), defaultAgentPrice: new Decimal(50), productCode: 'glo_cloud_500mb_youtube_50_time_oneoff1day' },
  { id: 'DATA_GLO_CLOUD_1_5GB_YT_T_O_1D', name: 'Glo Cloud 1.5GB Youtube Time Oneoff (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(130), defaultAgentPrice: new Decimal(130), productCode: 'glo_cloud_1_5gb_youtube_130_time_oneoff1day' },
  { id: 'DATA_GLO_CLOUD_500MB_YT_N_O_1D', name: 'Glo Cloud 500MB Youtube Night Oneoff (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(50), defaultAgentPrice: new Decimal(50), productCode: 'glo_cloud_500mb_youtube_50_time_night_oneoff1day' },
  { id: 'DATA_GLO_CLOUD_2GB_YT_N_O_7D', name: 'Glo Cloud 2GB Youtube Night Oneoff (7 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(200), defaultAgentPrice: new Decimal(200), productCode: 'glo_cloud_2gb_youtube_200_time_night_oneoff7days' },
  { id: 'DATA_GLO_CLOUD_1GB_S_300_1D', name: 'Glo Cloud 1GB Special 300 (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(300), defaultAgentPrice: new Decimal(300), productCode: 'glo_cloud_1gb_special_3001day' },
  { id: 'DATA_GLO_CLOUD_2GB_S_500_2D', name: 'Glo Cloud 2GB Special 500 (2 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(500), defaultAgentPrice: new Decimal(500), productCode: 'glo_cloud_2gb_special_5002days' },
  { id: 'DATA_GLO_CLOUD_3_58GB_1500_O_30D', name: 'Glo Cloud 3.58GB N1500 Oneoff (30 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(1500), defaultAgentPrice: new Decimal(1500), productCode: 'glo_cloud_3_58gb_n1500_oneoff30days' },
  { id: 'DATA_GLO_CLOUD_3GB_WKD_500_2D', name: 'Glo Cloud 3GB Weekend 500 (2 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(500), defaultAgentPrice: new Decimal(500), productCode: 'glo_cloud_3gb_weekend5002days' },
  { id: 'DATA_GLO_CLOUD_1_5GB_YT_500_30D', name: 'Glo Cloud 1.5GB Youtube N500 (30 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(500), defaultAgentPrice: new Decimal(500), productCode: 'glo_cloud_1_5gb_youtube_n50030days' },
  { id: 'DATA_GLO_CLOUD_4GB_YT_1000_30D', name: 'Glo Cloud 4GB Youtube N1000 (30 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(1000), defaultAgentPrice: new Decimal(1000), productCode: 'glo_cloud_4gb_youtube_n100030days' },
  { id: 'DATA_GLO_CLOUD_5GB_YT_T_500_5D', name: 'Glo Cloud 5GB Youtube Time N500 (5 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(500), defaultAgentPrice: new Decimal(500), productCode: 'glo_cloud_5gb_youtube_n500_time5days' },
  { id: 'DATA_GLO_CLOUD_10GB_YT_T_1000_10D', name: 'Glo Cloud 10GB Youtube Time N1000 (10 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(1000), defaultAgentPrice: new Decimal(1000), productCode: 'glo_cloud_10gb_youtube_n1000_time10days' },
  { id: 'DATA_GLO_CLOUD_1_5GB_YT_500_O_30D', name: 'Glo Cloud 1.5GB Youtube N500 Oneoff (30 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(500), defaultAgentPrice: new Decimal(500), productCode: 'glo_cloud_1_5gb_youtube_n500_oneoff30days' },
  { id: 'DATA_GLO_CLOUD_4GB_YT_1000_O_30D', name: 'Glo Cloud 4GB Youtube N1000 Oneoff (30 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(1000), defaultAgentPrice: new Decimal(1000), productCode: 'glo_cloud_4gb_youtube_n1000_oneoff30days' },
  { id: 'DATA_GLO_CLOUD_5GB_YT_T_500_O_5D', name: 'Glo Cloud 5GB Youtube Time N500 Oneoff (5 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(500), defaultAgentPrice: new Decimal(500), productCode: 'glo_cloud_5gb_youtube_n500_time_oneoff5days' },
  { id: 'DATA_GLO_CLOUD_10GB_YT_T_1000_O_10D', name: 'Glo Cloud 10GB Youtube Time N1000 Oneoff (10 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(1000), defaultAgentPrice: new Decimal(1000), productCode: 'glo_cloud_10gb_youtube_n1000_time_oneoff10days' },
  { id: 'DATA_GLO_CLOUD_CB_1000_5_8GB_30D', name: 'Glo Cloud Camp-Boost 1000 5.8GB (30 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(1000), defaultAgentPrice: new Decimal(1000), productCode: 'glo_cloud_camp-boost_10003_8gb__2gb_nite_5_8gb30days' },
  { id: 'DATA_GLO_CLOUD_CB_2000_14_4GB_30D', name: 'Glo Cloud Camp-Boost 2000 14.4GB (30 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(2000), defaultAgentPrice: new Decimal(2000), productCode: 'glo_cloud_camp-boost_200010_4__4gb_nite_14_4gb30days' },
  { id: 'DATA_GLO_CLOUD_CB_100_265MB_1D', name: 'Glo Cloud Camp-Boost 100 265MB (1 Day)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(100), defaultAgentPrice: new Decimal(100), productCode: 'glo_cloud_camp-boost_100230mb__35mb_nite_265mb1day' },
  { id: 'DATA_GLO_CLOUD_CB_200_590MB_2D', name: 'Glo Cloud Camp-Boost 200 590MB (2 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(200), defaultAgentPrice: new Decimal(200), productCode: 'glo_cloud_camp-boost_200480mb__110mb_nite_590mb2days' },
  { id: 'DATA_GLO_CLOUD_CB_500_2_6GB_14D', name: 'Glo Cloud Camp-Boost 500 2.6GB (14 Days)', category: 'VTU_DATA_CLOUD', platformPrice: new Decimal(500), defaultAgentPrice: new Decimal(500), productCode: 'glo_cloud_camp-boost_5001_6gb__1gb_nite_2_6gb14days' },

  // --- VTU Data: MTN SME ---
  { id: 'DATA_MTN_SME_1GB', name: 'MTN SME 1GB', category: 'VTU_DATA_SME', platformPrice: new Decimal(470), defaultAgentPrice: new Decimal(480), productCode: 'mtn_sme_1gb' },
  { id: 'DATA_MTN_SME_2GB', name: 'MTN SME 2GB', category: 'VTU_DATA_SME', platformPrice: new Decimal(1080), defaultAgentPrice: new Decimal(1100), productCode: 'data_share_2gb' },
  { id: 'DATA_MTN_SME_5GB', name: 'MTN SME 5GB', category: 'VTU_DATA_SME', platformPrice: new Decimal(2730), defaultAgentPrice: new Decimal(2750), productCode: 'data_share_5gb' },
  { id: 'DATA_MTN_SME_500MB', name: 'MTN SME 500MB', category: 'VTU_DATA_SME', platformPrice: new Decimal(360), defaultAgentPrice: new Decimal(365), productCode: 'mtn_sme_500mb' },
  { id: 'DATA_MTN_SME_3GB', name: 'MTN SME 3GB', category: 'VTU_DATA_SME', platformPrice: new Decimal(1630), defaultAgentPrice: new Decimal(1650), productCode: 'data_share_3gb' },
  { id: 'DATA_MTN_SME_10GB', name: 'MTN SME 10GB', category: 'VTU_DATA_SME', platformPrice: new Decimal(5450), defaultAgentPrice: new Decimal(5500), productCode: 'data_share_10gb' },
  { id: 'DATA_MTN_SME_1GB_M', name: 'MTN SME 1GB Monthly', category: 'VTU_DATA_SME', platformPrice: new Decimal(580), defaultAgentPrice: new Decimal(590), productCode: 'mtn_sme_igb_monthly' },

  // --- VTU Data: Glo Corporate ---
  { id: 'DATA_GLO_CG_200MB_14D', name: 'Glo CG 200MB (14 Days)', category: 'VTU_DATA_CG', platformPrice: new Decimal(78), defaultAgentPrice: new Decimal(79.8), productCode: 'glo_cg_200mb_14days' },
  { id: 'DATA_GLO_CG_500MB_30D', name: 'Glo CG 500MB (30 Days)', category: 'VTU_DATA_CG', platformPrice: new Decimal(195), defaultAgentPrice: new Decimal(199.5), productCode: 'glo_cg_500mb_30days' },
  { id: 'DATA_GLO_CG_1GB_30D', name: 'Glo CG 1GB (30 Days)', category: 'VTU_DATA_CG', platformPrice: new Decimal(390), defaultAgentPrice: new Decimal(399), productCode: 'glo_cg_1gb_30days' },
  { id: 'DATA_GLO_CG_2GB_30D', name: 'Glo CG 2GB (30 Days)', category: 'VTU_DATA_CG', platformPrice: new Decimal(790), defaultAgentPrice: new Decimal(798), productCode: 'glo_cg_2gb_30days' },
  { id: 'DATA_GLO_CG_3GB_30D', name: 'Glo CG 3GB (30 Days)', category: 'VTU_DATA_CG', platformPrice: new Decimal(1180), defaultAgentPrice: new Decimal(1197), productCode: 'glo_cg_3gb_30days' },
  { id: 'DATA_GLO_CG_5GB_30D', name: 'Glo CG 5GB (30 Days)', category: 'VTU_DATA_CG', platformPrice: new Decimal(1980), defaultAgentPrice: new Decimal(1995), productCode: 'glo_cg_5gb_30days' },
  { id: 'DATA_GLO_CG_10GB_30D', name: 'Glo CG 10GB (30 Days)', category: 'VTU_DATA_CG', platformPrice: new Decimal(3970), defaultAgentPrice: new Decimal(3990), productCode: 'glo_cg_10gb_30days' },
  { id: 'DATA_GLO_CG_1GB_3D', name: 'Glo CG 1GB (3 Days)', category: 'VTU_DATA_CG', platformPrice: new Decimal(265), defaultAgentPrice: new Decimal(270), productCode: 'glo_cg_1gb_3_days' },
  { id: 'DATA_GLO_CG_3GB_3D', name: 'Glo CG 3GB (3 Days)', category: 'VTU_DATA_CG', platformPrice: new Decimal(800), defaultAgentPrice: new Decimal(810), productCode: 'glo_cg_3gb_3_days' },
  { id: 'DATA_GLO_CG_5GB_3D', name: 'Glo CG 5GB (3 Days)', category: 'VTU_DATA_CG', platformPrice: new Decimal(1330), defaultAgentPrice: new Decimal(1350), productCode: 'glo_cg_5gb_3_days' },
  { id: 'DATA_GLO_CG_1GB_7D', name: 'Glo CG 1GB (7 Days)', category: 'VTU_DATA_CG', platformPrice: new Decimal(310), defaultAgentPrice: new Decimal(320), productCode: 'glo_cg_1gb_7_days' },
  { id: 'DATA_GLO_CG_3GB_7D', name: 'Glo CG 3GB (7 Days)', category: 'VTU_DATA_CG', platformPrice: new Decimal(940), defaultAgentPrice: new Decimal(960), productCode: 'glo_cg_3gb_7_days' },
  { id: 'DATA_GLO_CG_5GB_7D', name: 'Glo CG 5GB (7 Days)', category: 'VTU_DATA_CG', platformPrice: new Decimal(1580), defaultAgentPrice: new Decimal(1600), productCode: 'glo_cg_5gb_7_days' },

  // --- VTU Data: Airtel Corporate ---
  { id: 'DATA_AIRTEL_CG_100MB_7D_A', name: 'Airtel 100MB (7 Days)', category: 'VTU_DATA_CG', platformPrice: new Decimal(98), defaultAgentPrice: new Decimal(100), productCode: 'airtel_100mb_7days' },
  { id: 'DATA_AIRTEL_CG_300MB_7D_A', name: 'Airtel 300MB (7 Days)', category: 'VTU_DATA_CG', platformPrice: new Decimal(145), defaultAgentPrice: new Decimal(150), productCode: 'airtel_300mb_7days' },
  { id: 'DATA_AIRTEL_CG_500MB_30D_A', name: 'Airtel 500MB (30 Days)', category: 'VTU_DATA_CG', platformPrice: new Decimal(190), defaultAgentPrice: new Decimal(200), productCode: 'airtel_500mb_30days' },
  { id: 'DATA_AIRTEL_CG_1GB_30D_A', name: 'Airtel 1GB (30 Days)', category: 'VTU_DATA_CG', platformPrice: new Decimal(290), defaultAgentPrice: new Decimal(300), productCode: 'airtel_1gb_30days' },

  // --- VTU Data: 9mobile SME ---
  { id: 'DATA_9M_SME_1GB_A', name: '9Mobile SME 1GB', category: 'VTU_DATA_SME', platformPrice: new Decimal(290), defaultAgentPrice: new Decimal(300), productCode: 'etisalat_sme_1gb' },
  { id: 'DATA_9M_SME_1_5GB_A', name: '9Mobile SME 1.5GB', category: 'VTU_DATA_SME', platformPrice: new Decimal(440), defaultAgentPrice: new Decimal(450), productCode: 'etisalat_sme_1_5gb' },
  { id: 'DATA_9M_SME_2GB_A', name: '9Mobile SME 2GB', category: 'VTU_DATA_SME', platformPrice: new Decimal(580), defaultAgentPrice: new Decimal(600), productCode: 'etisalat_sme_2gb' },
  { id: 'DATA_9M_SME_3GB_A', name: '9Mobile SME 3GB', category: 'VTU_DATA_SME', platformPrice: new Decimal(880), defaultAgentPrice: new Decimal(900), productCode: 'etisalat_sme_3gb' },
  { id: 'DATA_9M_SME_5GB_A', name: '9Mobile SME 5GB', category: 'VTU_DATA_SME', platformPrice: new Decimal(1480), defaultAgentPrice: new Decimal(1500), productCode: 'etisalat_sme_5gb' },
  { id: 'DATA_9M_SME_10GB_A', name: '9Mobile SME 10GB', category: 'VTU_DATA_SME', platformPrice: new Decimal(2950), defaultAgentPrice: new Decimal(3000), productCode: 'etisalat_sme_10gb' },
  { id: 'DATA_9M_SME_15GB_A', name: '9Mobile SME 15GB', category: 'VTU_DATA_SME', platformPrice: new Decimal(4450), defaultAgentPrice: new Decimal(4500), productCode: 'etisalat_sme_15gb' },
  { id: 'DATA_9M_SME_20GB_A', name: '9Mobile SME 20GB', category: 'VTU_DATA_SME', platformPrice: new Decimal(5900), defaultAgentPrice: new Decimal(6000), productCode: 'etisalat_sme_20gb' },
  { id: 'DATA_9M_SME_50GB_A', name: '9Mobile SME 50GB', category: 'VTU_DATA_SME', platformPrice: new Decimal(14900), defaultAgentPrice: new Decimal(15000), productCode: 'etisalat_sme_50gb' },
  { id: 'DATA_9M_SME_500MB_A', name: '9Mobile SME 500MB', category: 'VTU_DATA_SME', platformPrice: new Decimal(145), defaultAgentPrice: new Decimal(150), productCode: 'etisalat_sme_500mb' },
  { id: 'DATA_9M_SME_100GB_A', name: '9Mobile SME 100GB', category: 'VTU_DATA_SME', platformPrice: new Decimal(29800), defaultAgentPrice: new Decimal(30000), productCode: 'etisalat_sme_100gb' },

  // --- VTU Data: MTN Corporate Data ---
  { id: 'DATA_MTN_CG_10GB_A', name: 'MTN CG 10GB', category: 'VTU_DATA_CG', platformPrice: new Decimal(2950), defaultAgentPrice: new Decimal(3000), productCode: 'corporate_data_10gb' },
  { id: 'DATA_MTN_CG_5GB_A', name: 'MTN CG 5GB', category: 'VTU_DATA_CG', platformPrice: new Decimal(1480), defaultAgentPrice: new Decimal(1500), productCode: 'corporate_data_5gb' },
  { id: 'DATA_MTN_CG_3GB_A', name: 'MTN CG 3GB', category: 'VTU_DATA_CG', platformPrice: new Decimal(880), defaultAgentPrice: new Decimal(900), productCode: 'corporate_data_3gb' },
  { id: 'DATA_MTN_CG_2GB_A', name: 'MTN CG 2GB', category: 'VTU_DATA_CG', platformPrice: new Decimal(580), defaultAgentPrice: new Decimal(600), productCode: 'corporate_data_2gb' },
  { id: 'DATA_MTN_CG_1GB_A', name: 'MTN CG 1GB', category: 'VTU_DATA_CG', platformPrice: new Decimal(290), defaultAgentPrice: new Decimal(300), productCode: 'corporate_data_1gb' },
  { id: 'DATA_MTN_CG_500MB_A', name: 'MTN CG 500MB', category: 'VTU_DATA_CG', platformPrice: new Decimal(145), defaultAgentPrice: new Decimal(150), productCode: 'corporate_data_500mb' },

  // --- VTU Data: Mtn direct data coupon ---
  { id: 'DATA_MTN_COUPON_3GB_30D', name: 'MTN 3GB (30 Days) Coupon', category: 'VTU_DATA_COUPON', platformPrice: new Decimal(990), defaultAgentPrice: new Decimal(1000), productCode: 'mtn_3gb_30_days_coupon' },
  { id: 'DATA_MTN_COUPON_9GB_30D', name: 'MTN 9GB (30 Days) Coupon', category: 'VTU_DATA_COUPON', platformPrice: new Decimal(1980), defaultAgentPrice: new Decimal(2000), productCode: 'mtn_9gb_30_days_coupon' },
  { id: 'DATA_MTN_COUPON_12GB_30D', name: 'MTN 12GB (30 Days) Coupon', category: 'VTU_DATA_COUPON', platformPrice: new Decimal(2970), defaultAgentPrice: new Decimal(3000), productCode: 'mtn_12gb_30_days_coupon' },
  { id: 'DATA_MTN_COUPON_24GB_30D', name: 'MTN 24GB (30 Days) Coupon', category: 'VTU_DATA_COUPON', platformPrice: new Decimal(3960), defaultAgentPrice: new Decimal(4000), productCode: 'mtn_24gb_30_days_coupon' },
  { id: 'DATA_MTN_COUPON_6GB_30D', name: 'MTN 6GB (30 Days) Coupon', category: 'VTU_DATA_COUPON', platformPrice: new Decimal(1480), defaultAgentPrice: new Decimal(1500), productCode: 'mtn_6gb_30_days_coupon' },

  // --- VTU Data: Mtn data share ---
  { id: 'DATA_MTN_SHARE_5GB', name: 'MTN 5GB Data share', category: 'VTU_DATA_SHARE', platformPrice: new Decimal(2450), defaultAgentPrice: new Decimal(2500), productCode: 'mtn_5gb_data_share' },
  { id: 'DATA_MTN_SHARE_3GB', name: 'MTN 3GB Data share', category: 'VTU_DATA_SHARE', platformPrice: new Decimal(1650), defaultAgentPrice: new Decimal(1700), productCode: 'mtn_3gb_data_share' },
  { id: 'DATA_MTN_SHARE_2GB', name: 'MTN 2GB Data share', category: 'VTU_DATA_SHARE', platformPrice: new Decimal(1100), defaultAgentPrice: new Decimal(1150), productCode: 'mtn_2gb_data_share' },
  { id: 'DATA_MTN_SHARE_1GB', name: 'MTN 1GB Data share', category: 'VTU_DATA_SHARE', platformPrice: new Decimal(470), defaultAgentPrice: new Decimal(480), productCode: 'mtn_1gb_data_share' },
  { id: 'DATA_MTN_SHARE_500MB', name: 'MTN 500MB Data share', category: 'VTU_DATA_SHARE', platformPrice: new Decimal(360), defaultAgentPrice: new Decimal(365), productCode: 'mtn_500mb_data_share' },
  { id: 'DATA_MTN_SHARE_1GB_30D', name: 'MTN 1GB Data share (30 Days)', category: 'VTU_DATA_SHARE', platformPrice: new Decimal(580), defaultAgentPrice: new Decimal(590), productCode: 'mtn_1gb_data_share_30_days' },
  { id: 'DATA_MTN_SHARE_3GB_7D', name: 'MTN 3GB Data share (7 Days)', category: 'VTU_DATA_SHARE', platformPrice: new Decimal(1430), defaultAgentPrice: new Decimal(1450), productCode: 'mtn_3gb_data_share_7_days' },
  { id: 'DATA_MTN_SHARE_2GB_7D', name: 'MTN 2GB Data share (7 Days)', category: 'VTU_DATA_SHARE', platformPrice: new Decimal(980), defaultAgentPrice: new Decimal(999), productCode: 'mtn_2gb_data_share_7_days' },
  
  // --- VTU Data: Airtel SME ---
  { id: 'DATA_AIRTEL_SME_10GB_30D', name: 'Airtel SME 10GB (30 Days)', category: 'VTU_DATA_SME', platformPrice: new Decimal(3300), defaultAgentPrice: new Decimal(3350), productCode: 'airtel_10gb30_days' },
  { id: 'DATA_AIRTEL_SME_1_5GB_7D', name: 'Airtel SME 1.5GB (7 Days)', category: 'VTU_DATA_SME', platformPrice: new Decimal(1080), defaultAgentPrice: new Decimal(1100), productCode: 'airtel_1_5gb7_days' },
  { id: 'DATA_AIRTEL_SME_7GB_7D', name: 'Airtel SME 7GB (7 Days)', category: 'VTU_DATA_SME', platformPrice: new Decimal(2200), defaultAgentPrice: new Decimal(2250), productCode: 'airtel_7gb7_days' },
  { id: 'DATA_AIRTEL_SME_10GB_7D', name: 'Airtel SME 10GB (7 Days)', category: 'VTU_DATA_SME', platformPrice: new Decimal(3250), defaultAgentPrice: new Decimal(3300), productCode: 'airtel_10gb7_days' },
  { id: 'DATA_AIRTEL_SME_18GB_7D', name: 'Airtel SME 18GB (7 Days)', category: 'VTU_DATA_SME', platformPrice: new Decimal(5450), defaultAgentPrice: new Decimal(5500), productCode: 'airtel_18gb7_days' },
  { id: 'DATA_AIRTEL_SME_600MB_2D', name: 'Airtel SME 600MB (2 Days)', category: 'VTU_DATA_SME', platformPrice: new Decimal(240), defaultAgentPrice: new Decimal(245), productCode: 'airtel_600mb2_days' },
  { id: 'DATA_AIRTEL_SME_6GB_7D', name: 'Airtel SME 6GB (7 Days)', category: 'VTU_DATA_SME', platformPrice: new Decimal(2700), defaultAgentPrice: new Decimal(2750), productCode: 'airtel_6gb7_days' },
  { id: 'DATA_AIRTEL_SME_1GB_1D_S', name: 'Airtel SME 1GB (1 Day) Special', category: 'VTU_DATA_SME', platformPrice: new Decimal(530), defaultAgentPrice: new Decimal(540), productCode: 'airtel_1gb1_day_special' },
  { id: 'DATA_AIRTEL_SME_1_5GB_2D_S', name: 'Airtel SME 1.5GB (2 Days) Special', category: 'VTU_DATA_SME', platformPrice: new Decimal(660), defaultAgentPrice: new Decimal(670), productCode: 'airtel_1_5gb2_days_special' },
  { id: 'DATA_AIRTEL_SME_2GB_2D_S', name: 'Airtel SME 2GB (2 Days) Special', category: 'VTU_DATA_SME', platformPrice: new Decimal(830), defaultAgentPrice: new Decimal(850), productCode: 'airtel_2gb2_days_special' },
  { id: 'DATA_AIRTEL_SME_3GB_2D_S', name: 'Airtel SME 3GB (2 Days) Special', category: 'VTU_DATA_SME', platformPrice: new Decimal(1080), defaultAgentPrice: new Decimal(1100), productCode: 'airtel_3gb2_days_special' },
  { id: 'DATA_AIRTEL_SME_3_5GB_7D', name: 'Airtel SME 3.5GB (7 Days)', category: 'VTU_DATA_SME', platformPrice: new Decimal(1580), defaultAgentPrice: new Decimal(1600), productCode: 'airtel_3_5gb7_days' },
  { id: 'DATA_AIRTEL_SME_5GB_2D', name: 'Airtel SME 5GB (2 Days)', category: 'VTU_DATA_SME', platformPrice: new Decimal(1580), defaultAgentPrice: new Decimal(1600), productCode: 'airtel_5gb2_days' },
  { id: 'DATA_AIRTEL_SME_200MB_2D', name: 'Airtel SME 200mb (2 Days)', category: 'VTU_DATA_SME', platformPrice: new Decimal(210), defaultAgentPrice: new Decimal(220), productCode: 'airtel_200mb2_days' },
  { id: 'DATA_AIRTEL_SME_300MB_2D', name: 'Airtel SME 300mb (2 Days)', category: 'VTU_DATA_SME', platformPrice: new Decimal(125), defaultAgentPrice: new Decimal(130), productCode: 'airtel_300mb2_days' },
  { id: 'DATA_AIRTEL_SME_150MB_1D', name: 'Airtel SME 150mb (1 Day)', category: 'VTU_DATA_SME', platformPrice: new Decimal(65), defaultAgentPrice: new Decimal(66), productCode: 'airtel_150mb1_day' },
  { id: 'DATA_AIRTEL_SME_1_5GB_7D_S', name: 'Airtel SME 1.5GB (7 Days) Social', category: 'VTU_DATA_SME', platformPrice: new Decimal(525), defaultAgentPrice: new Decimal(535), productCode: 'airtel_1_5gb7_days_social_bundle' },
  { id: 'DATA_AIRTEL_SME_1GB_3D_S', name: 'Airtel SME 1GB (3 Days) Social', category: 'VTU_DATA_SME', platformPrice: new Decimal(320), defaultAgentPrice: new Decimal(325), productCode: 'airtel_1gb3_days_social_bundle' },
  { id: 'DATA_AIRTEL_SME_9GB_7D', name: 'Airtel SME 9GB (7 Days)', category: 'VTU_DATA_SME', platformPrice: new Decimal(2800), defaultAgentPrice: new Decimal(2855), productCode: 'airtel_9gb7_days' },
  { id: 'DATA_AIRTEL_SME_1_5GB_1D', name: 'Airtel SME 1.5GB (1 Day)', category: 'VTU_DATA_SME', platformPrice: new Decimal(425), defaultAgentPrice: new Decimal(435), productCode: 'airtel_1_5gb1_day' },
  { id: 'DATA_AIRTEL_SME_4GB_2D', name: 'Airtel SME 4GB (2 Days)', category: 'VTU_DATA_SME', platformPrice: new Decimal(880), defaultAgentPrice: new Decimal(900), productCode: 'airtel_4gb2_days' },
  { id: 'DATA_AIRTEL_SME_13GB_30D', name: 'Airtel SME 13GB (30 Days)', category: 'VTU_DATA_SME', platformPrice: new Decimal(5900), defaultAgentPrice: new Decimal(6000), productCode: 'airtel_13gb30_days' },
  { id: "DATA_AIRTEL_SME_8GB_30D", name: "Airtel SME 8gb (30 Days)", category: "VTU_DATA_SME", platformPrice: new Decimal(2150), defaultAgentPrice: new Decimal(2200), productCode: "airtel_8gb30_days" },
  { id: 'DATA_AIRTEL_SME_60GB_60D', name: 'Airtel SME 60gb (60 Days)', category: 'VTU_DATA_SME', platformPrice: new Decimal(10800), defaultAgentPrice: new Decimal(11000), productCode: 'airtel_60gb60_days' },

  // --- VTU Data: Glo Awoof ---
  { id: 'DATA_GLO_AWOOF_750MB_1D', name: 'Glo Awoof 750MB (1 Day)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(180), defaultAgentPrice: new Decimal(186), productCode: 'glo_750mb1_day' },
  { id: 'DATA_GLO_AWOOF_1_5GB_1D', name: 'Glo Awoof 1.5GB (1 Day)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(270), defaultAgentPrice: new Decimal(279), productCode: 'glo_1_5gb1_day' },
  { id: 'DATA_GLO_AWOOF_2_5GB_2D', name: 'Glo Awoof 2.5GB (2 Days)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(450), defaultAgentPrice: new Decimal(465), productCode: 'glo_2_5gb2_days' },
  { id: 'DATA_GLO_AWOOF_10GB_7D', name: 'Glo Awoof 10GB (7 Days)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(1840), defaultAgentPrice: new Decimal(1860), productCode: 'glo_10gb7_days' },

  // --- VTU Data: Mtn Awoof ---
  { id: 'DATA_MTN_AWOOF_1GB_1D', name: 'MTN Awoof 1GB (1 Day)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(485), defaultAgentPrice: new Decimal(495), productCode: 'mtn_1gb1_day_plan' },
  { id: 'DATA_MTN_AWOOF_3_2GB_2D', name: 'MTN Awoof 3.2GB (2 Days)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(970), defaultAgentPrice: new Decimal(990), productCode: 'mtn_3_2gb2_days_plan' },
  { id: 'DATA_MTN_AWOOF_2_5GB_2D', name: 'MTN Awoof 2.5GB (2 Days)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(870), defaultAgentPrice: new Decimal(891), productCode: 'mtn_2_5gb2_days' },
  { id: 'DATA_MTN_AWOOF_2GB_2D', name: 'MTN Awoof 2GB (2 Days)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(730), defaultAgentPrice: new Decimal(742.5), productCode: 'mtn_2gb2_days' },
  { id: 'DATA_MTN_AWOOF_750MB_3D', name: 'MTN Awoof 750MB (3 Days)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(435), defaultAgentPrice: new Decimal(445.5), productCode: 'mtn_750mb3_days' },
  { id: 'DATA_MTN_AWOOF_1GB_7D', name: 'MTN Awoof 1GB (7 Days)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(780), defaultAgentPrice: new Decimal(792), productCode: 'mtn_1gb7_days' },
  { id: 'DATA_MTN_AWOOF_1_5GB_7D', name: 'MTN Awoof 1.5GB (7 Days)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(970), defaultAgentPrice: new Decimal(990), productCode: 'mtn_1_5gb7_days' },
  { id: 'DATA_MTN_AWOOF_1_2GB_7D', name: 'MTN Awoof 1.2GB (7 Days)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(730), defaultAgentPrice: new Decimal(742.5), productCode: 'mtn_1_2gb7_days' },
  { id: 'DATA_MTN_AWOOF_6GB_7D', name: 'MTN Awoof 6GB (7 Days)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(2450), defaultAgentPrice: new Decimal(2475), productCode: 'mtn_6gb7_days' },
  { id: 'DATA_MTN_AWOOF_11GB_7D', name: 'MTN Awoof 11GB (7 Days)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(3430), defaultAgentPrice: new Decimal(3465), productCode: 'mtn_11gb7_days' },
  { id: 'DATA_MTN_AWOOF_110MB_1D', name: 'MTN Awoof 110MB (1 Day)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(95), defaultAgentPrice: new Decimal(99), productCode: 'mtn_110mb1_day' },
  { id: 'DATA_MTN_AWOOF_230MB_1D', name: 'MTN Awoof 230MB (1 Day)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(190), defaultAgentPrice: new Decimal(198), productCode: 'mtn_230mb1_day' },
  { id: 'DATA_MTN_AWOOF_500MB_7D', name: 'MTN Awoof 500MB (7 Days)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(485), defaultAgentPrice: new Decimal(495), productCode: 'mtn_500mb7_days' },
  { id: 'DATA_MTN_AWOOF_6_75GB_30D', name: 'MTN Awoof 6.75GB XTRA (30 Days)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(2940), defaultAgentPrice: new Decimal(2970), productCode: '6_75gb_xtra-special30_days' },
  { id: 'DATA_MTN_AWOOF_14_5GB_30D', name: 'MTN Awoof 14.5GB XTRA (30 Days)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(4900), defaultAgentPrice: new Decimal(4950), productCode: '14_5gb_xtra-special30_days' },
  { id: 'DATA_MTN_AWOOF_1_5GB_2D', name: 'MTN Awoof 1.5GB (2 Days)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(580), defaultAgentPrice: new Decimal(594), productCode: 'mtn_1_5gb2_days' },
  { id: 'DATA_MTN_AWOOF_1_8GB_30D', name: 'MTN Awoof 1.8GB Thryve (30 Days)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(1460), defaultAgentPrice: new Decimal(1485), productCode: '1_8gb_thryvedata30_days' },
  { id: 'DATA_MTN_AWOOF_1_2GB_30D_S', name: 'MTN Awoof 1.2GB Social (30 Days)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(435), defaultAgentPrice: new Decimal(445.5), productCode: 'mtn_1_2gb_all_social_30_days' },
  { id: 'DATA_MTN_AWOOF_20GB_7D', name: 'MTN Awoof 20GB (7 Days)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(4900), defaultAgentPrice: new Decimal(4950), productCode: 'mtn_20gb7_days' },
  { id: 'DATA_MTN_AWOOF_500MB_1D', name: 'MTN Awoof 500MB (1 Day)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(340), defaultAgentPrice: new Decimal(346.5), productCode: 'mtn_500mb1_day' },
  { id: 'DATA_MTN_AWOOF_2_5GB_1D', name: 'MTN Awoof 2.5GB (1 Day)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(730), defaultAgentPrice: new Decimal(742.5), productCode: 'mtn_2_5gb1_day' },
  { id: 'DATA_MTN_AWOOF_3_5GB_7D', name: 'MTN Awoof 3.5GB (7 Days)', category: 'VTU_DATA_AWOOF', platformPrice: new Decimal(1460), defaultAgentPrice: new Decimal(1485), productCode: 'mtn_3_5gb7_days_plan' },

  // --- VTU Data: 9mobile Corporate ---
  { id: 'DATA_9M_CG_1GB_30D', name: '9Mobile CG 1GB (30 Days)', category: 'VTU_DATA_CG', platformPrice: new Decimal(290), defaultAgentPrice: new Decimal(300), productCode: 'etisalat_cg_1gb_30days' },

  // --- VTU Data: Airtel SME Lite ---
  { id: 'DATA_AIRTEL_SME_LITE_1GB_7D', name: 'Airtel SME Lite 1GB (7 Days)', category: 'VTU_DATA_SME_LITE', platformPrice: new Decimal(770), defaultAgentPrice: new Decimal(779), productCode: 'airtel_1gb7_days_lite' },
  { id: 'DATA_AIRTEL_SME_LITE_2GB_30D', name: 'Airtel SME Lite 2GB (30 Days)', category: 'VTU_DATA_SME_LITE', platformPrice: new Decimal(1540), defaultAgentPrice: new Decimal(1558), productCode: 'airtel_2gb30_days_lite' },
  { id: 'DATA_AIRTEL_SME_LITE_3GB_30D', name: 'Airtel SME Lite 3GB (30 Days)', category: 'VTU_DATA_SME_LITE', platformPrice: new Decimal(2300), defaultAgentPrice: new Decimal(2337), productCode: 'airtel_3gb30_days_lite' },
  { id: 'DATA_AIRTEL_SME_LITE_8GB_30D', name: 'Airtel SME Lite 8GB (30 Days)', category: 'VTU_DATA_SME_LITE', platformPrice: new Decimal(6200), defaultAgentPrice: new Decimal(6232), productCode: 'airtel_8gb30_days_lite' },
  { id: 'DATA_AIRTEL_SME_LITE_10GB_30D', name: 'Airtel SME Lite 10GB (30 Days)', category: 'VTU_DATA_SME_LITE', platformPrice: new Decimal(7750), defaultAgentPrice: new Decimal(7790), productCode: 'airtel_10gb30_days_lite' },

  // --- VTU Electricity ---
  { id: 'ELEC_AEDC_POST', name: 'AEDC PostPaid', category: 'VTU_ELEC', platformPrice: new Decimal(99), defaultAgentPrice: new Decimal(100), productCode: 'aedc_postpaid_custom' },
  { id: 'ELEC_AEDC_PRE', name: 'AEDC PrePaid', category: 'VTU_ELEC', platformPrice: new Decimal(99), defaultAgentPrice: new Decimal(100), productCode: 'aedc_prepaid_custom' },
  { id: 'ELEC_KNEDC_POST', name: 'Kaduna PostPaid', category: 'VTU_ELEC', platformPrice: new Decimal(99), defaultAgentPrice: new Decimal(100), productCode: 'knedc_postpaid_custom' },
  { id: 'ELEC_KNEDC_PRE', name: 'Kaduna PrePaid', category: 'VTU_ELEC', platformPrice: new Decimal(99), defaultAgentPrice: new Decimal(100), productCode: 'knedc_prepaid_custom' },
  { id: 'ELEC_KEDC_PRE', name: 'Kano PrePaid', category: 'VTU_ELEC', platformPrice: new Decimal(99), defaultAgentPrice: new Decimal(100), productCode: 'kedc_prepaid_custom' },
  { id: 'ELEC_KEDC_POST', name: 'Kano PostPaid', category: 'VTU_ELEC', platformPrice: new Decimal(99), defaultAgentPrice: new Decimal(100), productCode: 'kedc__postpaid_custom' },
  { id: 'ELEC_YEDC_POST', name: 'Yola PostPaid', category: 'VTU_ELEC', platformPrice: new Decimal(99), defaultAgentPrice: new Decimal(100), productCode: 'yedc_postpaid_custom' },
  { id: 'ELEC_YEDC_PRE', name: 'Yola PrePaid', category: 'VTU_ELEC', platformPrice: new Decimal(99), defaultAgentPrice: new Decimal(100), productCode: 'yedc_prepaid_custom' },
  { id: 'ELEC_PHED_POST', name: 'PH PostPaid', category: 'VTU_ELEC', platformPrice: new Decimal(99), defaultAgentPrice: new Decimal(100), productCode: 'phed_postpaid_custom' },
  { id: 'ELEC_PHED_PRE', name: 'PH PrePaid', category: 'VTU_ELEC', platformPrice: new Decimal(99), defaultAgentPrice: new Decimal(100), productCode: 'phed_prepaid_custom' },
  { id: 'ELEC_EEDC_POST', name: 'Enugu PostPaid', category: 'VTU_ELEC', platformPrice: new Decimal(99), defaultAgentPrice: new Decimal(100), productCode: 'eedc_postpaid_custom' },
  { id: 'ELEC_EEDC_PRE', name: 'Enugu PrePaid', category: 'VTU_ELEC', platformPrice: new Decimal(99), defaultAgentPrice: new Decimal(100), productCode: 'eedc_prepaid_custom' },
  { id: 'ELEC_BEDC_POST', name: 'Benin PostPaid', category: 'VTU_ELEC', platformPrice: new Decimal(99), defaultAgentPrice: new Decimal(100), productCode: 'bedc_postpaid_custom' },
  { id: 'ELEC_BEDC_PRE', name: 'Benin PrePaid', category: 'VTU_ELEC', platformPrice: new Decimal(99), defaultAgentPrice: new Decimal(100), productCode: 'bedc_prepaid_custom' },
  { id: 'ELEC_EKEDC_POST', name: 'Eko PostPaid', category: 'VTU_ELEC', platformPrice: new Decimal(99), defaultAgentPrice: new Decimal(100), productCode: 'ekedc_postpaid_custom' },
  { id: 'ELEC_EKEDC_PRE', name: 'Eko PrePaid', category: 'VTU_ELEC', platformPrice: new Decimal(99), defaultAgentPrice: new Decimal(100), productCode: 'ekedc_prepaid_custom' },
  { id: 'ELEC_IKEDC_POST', name: 'Ikeja PostPaid', category: 'VTU_ELEC', platformPrice: new Decimal(99), defaultAgentPrice: new Decimal(100), productCode: 'ikedc_postpaid_custom' },
  { id: 'ELEC_IKEDC_PRE', name: 'Ikeja PrePaid', category: 'VTU_ELEC', platformPrice: new Decimal(99), defaultAgentPrice: new Decimal(100), productCode: 'ikedc_prepaid_custom' },
  { id: 'ELEC_IBEDC_POST', name: 'Ibadan PostPaid', category: 'VTU_ELEC', platformPrice: new Decimal(99), defaultAgentPrice: new Decimal(100), productCode: 'ibedc_postpaid_custom' },
  { id: 'ELEC_IBEDC_PRE', name: 'Ibadan PrePaid', category: 'VTU_ELEC', platformPrice: new Decimal(99), defaultAgentPrice: new Decimal(100), productCode: 'ibedc_prepaid_custom' },
  { id: 'ELEC_JEDC_POST', name: 'Jos PostPaid', category: 'VTU_ELEC', platformPrice: new Decimal(99), defaultAgentPrice: new Decimal(100), productCode: 'jedc_postpaid_custom' },
  { id: 'ELEC_JEDC_PRE', name: 'Jos PrePaid', category: 'VTU_ELEC', platformPrice: new Decimal(99), defaultAgentPrice: new Decimal(100), productCode: 'jedc_prepaid_custom' },
  
  // --- System Services ---
  { id: 'AGGREGATOR_UPGRADE', name: 'Aggregator Upgrade Fee', category: 'SYSTEM', platformPrice: new Decimal(0.00), defaultAgentPrice: new Decimal(5000.00), productCode: null },

  // --- BVN Services ---
  { id: 'BVN_VERIFY_SLIP', name: 'BVN Verification Slip', category: 'BVN', platformPrice: new Decimal(100.00), defaultAgentPrice: new Decimal(150.00), productCode: 'bvn_verify_slip' },
  { id: 'BVN_VERIFY_PREMIUM', name: 'BVN Premium Slip', category: 'BVN', platformPrice: new Decimal(200.00), defaultAgentPrice: new Decimal(250.00), productCode: 'bvn_verify_premium' },
  { id: 'BVN_RETRIEVAL_PHONE', name: 'BVN Retrieval (Phone)', category: 'BVN', platformPrice: new Decimal(1000.00), defaultAgentPrice: new Decimal(1200.00), productCode: null },
  { id: 'BVN_RETRIEVAL_CRM', name: 'BVN Retrieval (C.R.M)', category: 'BVN', platformPrice: new Decimal(2000.00), defaultAgentPrice: new Decimal(2200.00), productCode: null },
  { id: 'BVN_MOD_NAME', name: 'BVN Modification (Name)', category: 'BVN', platformPrice: new Decimal(3000.00), defaultAgentPrice: new Decimal(3500.00), productCode: null },
  { id: 'BVN_MOD_DOB', name: 'BVN Modification (DOB)', category: 'BVN', platformPrice: new Decimal(3000.00), defaultAgentPrice: new Decimal(3500.00), productCode: null },
  { id: 'BVN_MOD_PHONE', name: 'BVN Modification (Phone)', category: 'BVN', platformPrice: new Decimal(3000.00), defaultAgentPrice: new Decimal(3500.00), productCode: null },
  { id: 'BVN_MOD_NAME_DOB', name: 'BVN Modification (Name & DOB)', category: 'BVN', platformPrice: new Decimal(5000.00), defaultAgentPrice: new Decimal(5500.00), productCode: null },
  { id: 'BVN_MOD_NAME_PHONE', name: 'BVN Modification (Name & Phone)', category: 'BVN', platformPrice: new Decimal(5000.00), defaultAgentPrice: new Decimal(5500.00), productCode: null },
  { id: 'BVN_MOD_DOB_PHONE', name: 'BVN Modification (DOB & Phone)', category: 'BVN', platformPrice: new Decimal(5000.00), defaultAgentPrice: new Decimal(5500.00), productCode: null },
  { id: 'BVN_ENROLLMENT_ANDROID', name: 'BVN Android Enrollment', category: 'BVN', platformPrice: new Decimal(1000.00), defaultAgentPrice: new Decimal(1200.00), productCode: null },
  { id: 'BVN_VNIN_TO_NIBSS', name: 'VNIN to NIBSS', category: 'BVN', platformPrice: new Decimal(1500.00), defaultAgentPrice: new Decimal(1600.00), productCode: null },
];

async function main() {
  console.log('Start seeding services...');
  
  for (const service of services) {
    // Check if isActive is defined in the object, otherwise default to true
    const isActive = (service as any).isActive !== undefined ? (service as any).isActive : true;

    await prisma.service.upsert({
      where: { id: service.id },
      
      // --- THIS IS THE FIX ---
      // We ONLY update non-price information.
      // Prices set in the admin dashboard will now be permanent.
      update: {
        name: service.name,
        category: service.category,
        productCode: service.productCode,
        // isActive is intentionally left out of update so admin setting persists
      },
      
      // CREATE is only called if the service ID does not exist
      // This block WILL set the prices, but only for new services.
      create: {
        id: service.id,
        name: service.name,
        category: service.category,
        platformPrice: service.platformPrice,
        defaultAgentPrice: service.defaultAgentPrice,
        productCode: service.productCode,
        isActive: isActive,
      },
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
