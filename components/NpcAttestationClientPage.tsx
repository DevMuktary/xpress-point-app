"use client";

import React, { useState, useMemo } from 'react';
import { 
  UserIcon, MapPinIcon, DocumentTextIcon, CheckCircleIcon, 
  InformationCircleIcon, ArrowPathIcon, XMarkIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';

// --- Full Nigeria Data (States & LGAs) ---
const NIGERIA_DATA: Record<string, string[]> = {
  "Abia": ["Aba North", "Aba South", "Arochukwu", "Bende", "Ikwuano", "Isiala Ngwa North", "Isiala Ngwa South", "Isuikwuato", "Obi Ngwa", "Ohafia", "Osisioma", "Ugwunagbo", "Ukwa East", "Ukwa West", "Umuahia North", "Umuahia South", "Umu Nneochi"],
  "Adamawa": ["Demsa", "Fufure", "Ganye", "Gayuk", "Gombi", "Grie", "Hong", "Jada", "Lamurde", "Madagali", "Maiha", "Mayo Belwa", "Michika", "Mubi North", "Mubi South", "Numan", "Shelleng", "Song", "Toungo", "Yola North", "Yola South"],
  "Akwa Ibom": ["Abak", "Eastern Obolo", "Eket", "Esit Eket", "Essien Udim", "Etim Ekpo", "Etinan", "Ibeno", "Ibesikpo Asutan", "Ibiono-Ibom", "Ika", "Ikono", "Ikot Abasi", "Ikot Ekpene", "Ini", "Itu", "Mbo", "Mkpat-Enin", "Nsit-Atai", "Nsit-Ibom", "Nsit-Ubium", "Obot Akara", "Okobo", "Onna", "Oron", "Oruk Anam", "Udung-Uko", "Ukanafun", "Uruan", "Urue-Offong/Oruko", "Uyo"],
  "Anambra": ["Aguata", "Anambra East", "Anambra West", "Anaocha", "Awka North", "Awka South", "Ayamelum", "Dunukofia", "Ekwusigo", "Idemili North", "Idemili South", "Ihiala", "Njikoka", "Nnewi North", "Nnewi South", "Ogbaru", "Onitsha North", "Onitsha South", "Orumba North", "Orumba South", "Oyi"],
  "Bauchi": ["Alkaleri", "Bauchi", "Bogoro", "Damban", "Darazo", "Dass", "Gamawa", "Ganjuwa", "Giade", "Itas/Gadau", "Jama'are", "Katagum", "Kirfi", "Misau", "Ningi", "Shira", "Tafawa Balewa", "Toro", "Warji", "Zaki"],
  "Bayelsa": ["Brass", "Ekeremor", "Kolokuma/Opokuma", "Nembe", "Ogbia", "Sagbama", "Southern Ijaw", "Yenagoa"],
  "Benue": ["Agatu", "Apa", "Ado", "Buruku", "Gboko", "Guma", "Gwer East", "Gwer West", "Katsina-Ala", "Konshisha", "Kwande", "Logo", "Makurdi", "Obi", "Ogbadibo", "Ohimini", "Oju", "Okpokwu", "Oturkpo", "Tarka", "Ukum", "Ushongo", "Vandeikya"],
  "Borno": ["Abadam", "Askira/Uba", "Bama", "Bayo", "Biu", "Chibok", "Damboa", "Dikwa", "Gubio", "Guzamala", "Gwoza", "Hawul", "Jere", "Kaga", "Kala/Balge", "Konduga", "Kukawa", "Kwaya Kusar", "Mafa", "Magumeri", "Maiduguri", "Marte", "Mobbar", "Monguno", "Ngala", "Nganzai", "Shani"],
  "Cross River": ["Abi", "Akamkpa", "Akpabuyo", "Bakassi", "Bekwarra", "Biase", "Boki", "Calabar Municipal", "Calabar South", "Etung", "Ikom", "Obanliku", "Obubra", "Obudu", "Odukpani", "Ogoja", "Yakuur", "Yala"],
  "Delta": ["Aniocha North", "Aniocha South", "Bomadi", "Burutu", "Ethiope East", "Ethiope West", "Ika North East", "Ika South", "Isoko North", "Isoko South", "Ndokwa East", "Ndokwa West", "Okpe", "Oshimili North", "Oshimili South", "Patani", "Sapele", "Udu", "Ugwunagbo", "Ukwuani", "Uvwie", "Warri North", "Warri South", "Warri South West"],
  "Ebonyi": ["Abakaliki", "Afikpo North", "Afikpo South (Edda)", "Ebonyi", "Ezza North", "Ezza South", "Ikwo", "Ishielu", "Ivo", "Izzi", "Ohaozara", "Ohaukwu", "Onicha"],
  "Edo": ["Akoko-Edo", "Egor", "Esan Central", "Esan North-East", "Esan South-East", "Esan West", "Etsako Central", "Etsako East", "Etsako West", "Igueben", "Ikpoba Okha", "Orhionmwon", "Oredo", "Ovia North-East", "Ovia South-West", "Owan East", "Owan West", "Uhunmwonde"],
  "Ekiti": ["Ado Ekiti", "Efon", "Ekiti East", "Ekiti South-West", "Ekiti West", "Emure", "Gbonyin", "Ido Osi", "Ijero", "Ikere", "Ikole", "Ilejemeje", "Irepodun/Ifelodun", "Ise/Orun", "Moba", "Oye"],
  "Enugu": ["Aninri", "Awgu", "Enugu East", "Enugu North", "Enugu South", "Ezeagu", "Igbo Etiti", "Igbo Eze North", "Igbo Eze South", "Isi Uzo", "Nkanu East", "Nkanu West", "Nsukka", "Oji River", "Udenu", "Udi", "Uzo Uwani"],
  "FCT": ["Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Municipal Area Council"],
  "Gombe": ["Akko", "Balanga", "Billiri", "Dukku", "Funakaye", "Gombe", "Kaltungo", "Kwami", "Nafada", "Shongom", "Yamaltu/Deba"],
  "Imo": ["Aboh Mbaise", "Ahiazu Mbaise", "Ehime Mbano", "Ezinihitte", "Ideato North", "Ideato South", "Ihitte/Uboma", "Ikeduru", "Isiala Mbano", "Isu", "Mbaitoli", "Ngor Okpala", "Njaba", "Nkwerre", "Nwangele", "Obowo", "Oguta", "Ohaji/Egbema", "Okigwe", "Orlu", "Orsu", "Oru East", "Oru West", "Owerri Municipal", "Owerri North", "Owerri West", "Unuimo"],
  "Jigawa": ["Auyo", "Babura", "Biriniwa", "Birnin Kudu", "Buji", "Dutse", "Gagarawa", "Garki", "Gumel", "Guri", "Gwaram", "Gwiwa", "Hadejia", "Jahun", "Kafin Hausa", "Kazaure", "Kiri Kasama", "Kiyawa", "Kaugama", "Maigatari", "Malam Madori", "Miga", "Ringim", "Roni", "Sule Tankarkar", "Taura", "Yankwashi"],
  "Kaduna": ["Birnin Gwari", "Chikun", "Giwa", "Igabi", "Ikara", "Jaba", "Jema'a", "Kachia", "Kaduna North", "Kaduna South", "Kagarko", "Kajuru", "Kaura", "Kauru", "Kubau", "Kudan", "Lere", "Makarfi", "Sabon Gari", "Sanga", "Soba", "Zangon Kataf", "Zaria"],
  "Kano": ["Ajingi", "Albasu", "Bagwai", "Bebeji", "Bichi", "Bunkure", "Dala", "Dambatta", "Dawakin Kudu", "Dawakin Tofa", "Dogo Kinda", "Fagge", "Gabasawa", "Garko", "Garun Mallam", "Gaya", "Gezawa", "Gwale", "Gwarzo", "Kabo", "Kano Municipal", "Karaye", "Kibiya", "Kiru", "Kumbotso", "Kunchi", "Kura", "Madobi", "Makoda", "Minjibir", "Nasarawa", "Rano", "Rimin Gado", "Rogo", "Shano", "Sumaila", "Takai", "Tarauni", "Tofa", "Tsanyawa", "Tudun Wada", "Ungogo", "Warawa", "Wudil"],
  "Katsina": ["Bakori", "Batagarawa", "Batsari", "Baure", "Bindawa", "Charanchi", "Dandume", "Danja", "Dan Musa", "Daura", "Dutsi", "Dutsin Ma", "Faskari", "Funtua", "Ingawa", "Jibia", "Kafur", "Kaita", "Kankara", "Kankia", "Katsina", "Kurfi", "Kusada", "Mai'Adua", "Malumfashi", "Mani", "Mashi", "Matazu", "Musawa", "Rimi", "Sabuwa", "Safana", "Sandamu", "Zango"],
  "Kebbi": ["Aleiro", "Arewa Dandi", "Argungu", "Augie", "Bagudo", "Birnin Kebbi", "Bunza", "Dandi", "Fakai", "Gwandu", "Jega", "Kalgo", "Koko/Besse", "Maiyama", "Ngaski", "Sakaba", "Shanga", "Suru", "Wasagu/Danko", "Yauri", "Zuru"],
  "Kogi": ["Adavi", "Ajaokuta", "Ankpa", "Bassa", "Dekina", "Ibaji", "Idah", "Igalamela Odolu", "Ijumu", "Kabba/Bunu", "Kogi", "Lokoja", "Mopa Muro", "Ofu", "Ogori/Magongo", "Okehi", "Okene", "Olamaboro", "Omala", "Yagba East", "Yagba West"],
  "Kwara": ["Asa", "Baruten", "Edu", "Ekiti", "Ifelodun", "Ilorin East", "Ilorin South", "Ilorin West", "Irepodun", "Isin", "Kaiama", "Moro", "Offa", "Oke Ero", "Oyun", "Pategi"],
  "Lagos": ["Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry", "Epe", "Eti Osa", "Ibeju-Lekki", "Ifako-Ijaiye", "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland", "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"],
  "Nasarawa": ["Akwanga", "Awe", "Doma", "Karu", "Keana", "Keffi", "Lafia", "Nasarawa", "Nasarawa Egon", "Obi", "Toto", "Wamba"],
  "Niger": ["Agaie", "Agwara", "Bida", "Borgu", "Bosso", "Chanchaga", "Edati", "Gbako", "Gurara", "Katcha", "Kontagora", "Lapai", "Lavun", "Magama", "Mariga", "Mashegu", "Mokwa", "Moya", "Paikoro", "Rafi", "Rijau", "Shiroro", "Suleja", "Tafa", "Wushishi"],
  "Ogun": ["Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Egbado North", "Egbado South", "Ewekoro", "Ifo", "Ijebu East", "Ijebu North", "Ijebu North East", "Ijebu Ode", "Ikenne", "Imeko Afon", "Ipokia", "Obafemi Owode", "Odeda", "Ogun Waterside", "Remo North", "Shagamu"],
  "Ondo": ["Akoko North-East", "Akoko North-West", "Akoko South-East", "Akoko South-West", "Akure North", "Akure South", "Ese Odo", "Idanre", "Ifedore", "Ilaje", "Ile Oluji/Okeigbo", "Irele", "Odigbo", "Okitipupa", "Ondo East", "Ondo West", "Ose", "Owo"],
  "Osun": ["Aiyedaade", "Aiyedire", "Atakunmosa East", "Atakunmosa West", "Boluwaduro", "Boripe", "Ede North", "Ede South", "Egbedore", "Ejigbo", "Ife Central", "Ife East", "Ife North", "Ife South", "Ifedayo", "Ifelodun", "Ila", "Ilesa East", "Ilesa West", "Irepodun", "Iwo", "Obokun", "Odo Otin", "Ola Oluwa", "Olorunda", "Oriade", "Orolu", "Osogbo"],
  "Oyo": ["Afijio", "Akinyele", "Atiba", "Atisbo", "Egbeda", "Ibadan North", "Ibadan North-East", "Ibadan North-West", "Ibadan South-East", "Ibadan South-West", "Ibarapa Central", "Ibarapa East", "Ibarapa North", "Ido", "Irepo", "Iseyin", "Itesiwaju", "Iwajowa", "Kajola", "Lagelu", "Ogbomosho North", "Ogbomosho South", "Ogo Oluwa", "Olorunsogo", "Oluyole", "Ona Ara", "Orelope", "Ori Ire", "Oyo East", "Oyo West", "Saki East", "Saki West", "Surulere"],
  "Plateau": ["Bokkos", "Barkin Ladi", "Bassa", "Jos East", "Jos North", "Jos South", "Kanam", "Kanke", "Langtang North", "Langtang South", "Mangu", "Mikang", "Pankshin", "Qua'an Pan", "Riyom", "Shendam", "Wase"],
  "Rivers": ["Abua/Odual", "Ahoada East", "Ahoada West", "Akuku-Toru", "Andoni", "Asari-Toru", "Bonny", "Degema", "Eleme", "Emuoha", "Etche", "Gokana", "Ikwerre", "Khana", "Obio/Akpor", "Ogba/Egbema/Ndoni", "Ogu/Bolo", "Okrika", "Omuma", "Opobo/Nkoro", "Oyigbo", "Port Harcourt", "Tai"],
  "Sokoto": ["Binji", "Bodinga", "Dange Shuni", "Gada", "Goronyo", "Gudu", "Gwadabawa", "Illela", "Isa", "Kebbe", "Kware", "Rabah", "Sabon Birni", "Shagari", "Silame", "Sokoto North", "Sokoto South", "Tambuwal", "Tangaza", "Tureta", "Wamako", "Wurno", "Yabo"],
  "Taraba": ["Ardo Kola", "Bali", "Donga", "Gashaka", "Gassol", "Ibi", "Jalingo", "Karim Lamido", "Kumi", "Lau", "Sardauna", "Takum", "Ussa", "Wukari", "Yorro", "Zing"],
  "Yobe": ["Bade", "Bursari", "Damaturu", "Fika", "Fune", "Geidam", "Gujba", "Gulani", "Jakusko", "Karasuwa", "Machina", "Nangere", "Nguru", "Potiskum", "Tarmuwa", "Yunusari", "Yusufari"],
  "Zamfara": ["Anka", "Bakura", "Birnin Magaji/Kiyaw", "Bukkuyum", "Bungudu", "Gummi", "Gusau", "Kaura Namoda", "Maradun", "Maru", "Shinkafi", "Talata Mafara", "Chafe", "Zurmi"]
};
const ALL_STATES = Object.keys(NIGERIA_DATA).sort();

// --- Reusable Input ---
const DataInput = ({ label, id, value, onChange, type = "text", isRequired = true, placeholder = "" }: any) => (
  <div className="col-span-1">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      id={id} type={type} value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      required={isRequired} placeholder={placeholder}
    />
  </div>
);

// --- Reusable Select ---
const DataSelect = ({ label, id, value, onChange, options, disabled = false }: any) => (
  <div className="col-span-1">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <select
      id={id} value={value} onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      required
      disabled={disabled}
    >
      <option value="">-- Select --</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const FileUpload = ({ label, id, file, onChange, isUploading }: any) => (
  <div className="col-span-2">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="mt-1 flex items-center gap-4">
      <input
        id={id} type="file" onChange={onChange} accept="image/png, image/jpeg, application/pdf" required
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {isUploading && <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-600" />}
      {file && <CheckCircleIcon className="h-6 w-6 text-green-600" />}
    </div>
  </div>
);

export default function NpcAttestationClientPage({ serviceFee }: { serviceFee: number }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
  // --- Form State ---
  const [formData, setFormData] = useState<any>({});
  
  // --- File State ---
  const [affidavitFile, setAffidavitFile] = useState<File | null>(null);
  const [affidavitUrl, setAffidavitUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // --- Helper for Dynamic LGAs ---
  const getLgas = (stateName: string) => {
    return stateName && NIGERIA_DATA[stateName] ? NIGERIA_DATA[stateName] : [];
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setAffidavitFile(file);
    setIsUploading(true);
    setAffidavitUrl(null);

    try {
      const data = new FormData();
      data.append('attestation', file);
      const res = await fetch('/api/upload', { method: 'POST', body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setAffidavitUrl(json.url);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(null);

    if (!affidavitUrl) {
      setSubmitError("Please wait for the Affidavit to finish uploading.");
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/services/npc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          formData, 
          affidavitUrl 
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSuccess(data.message);
      window.scrollTo(0, 0);
      setFormData({});
      setAffidavitFile(null);
      setAffidavitUrl(null);

    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {isSubmitting && <Loading />}

      {success && (
        <div className="rounded-lg bg-blue-50 p-4 border border-blue-200 flex gap-3 animate-in fade-in">
          <CheckCircleIcon className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="text-sm font-bold text-blue-800">Request Submitted Successfully!</h3>
            <p className="text-sm text-blue-700 mt-1">
               Your request is now <strong className="font-semibold">PENDING</strong>. 
               Monitor status at <Link href="/dashboard/history/attestation" className="underline hover:text-blue-900 font-bold">Attestation History</Link>.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        
        {/* Info Box */}
        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-blue-800 text-sm flex gap-3">
          <InformationCircleIcon className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-bold">Processing Time</p>
            <p>Certificate will be ready within 48-72 working hours.</p>
          </div>
        </div>

        <form onSubmit={handleOpenConfirm} className="space-y-8">
          
          {/* 1. Personal Info */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-gray-500" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataInput label="Surname" id="surname" value={formData.surname || ''} onChange={(v: string) => handleChange('surname', v)} />
              <DataInput label="First Name" id="firstName" value={formData.firstName || ''} onChange={(v: string) => handleChange('firstName', v)} />
              <DataInput label="Middle Name" id="middleName" value={formData.middleName || ''} onChange={(v: string) => handleChange('middleName', v)} isRequired={false} />
              <DataSelect label="Sex" id="sex" value={formData.sex || ''} onChange={(v: string) => handleChange('sex', v)} options={['Male', 'Female']} />
              <DataInput label="Date of Birth" id="dob" type="date" value={formData.dob || ''} onChange={(v: string) => handleChange('dob', v)} />
              <DataSelect label="Marital Status" id="marital" value={formData.maritalStatus || ''} onChange={(v: string) => handleChange('maritalStatus', v)} options={['Single', 'Married', 'Divorced', 'Widowed']} />
              
              {/* Origin State & LGA */}
              <DataSelect label="State of Origin" id="stateOrigin" value={formData.stateOrigin || ''} onChange={(v: string) => handleChange('stateOrigin', v)} options={ALL_STATES} />
              <DataSelect label="LGA of Origin" id="lgaOrigin" value={formData.lgaOrigin || ''} onChange={(v: string) => handleChange('lgaOrigin', v)} options={getLgas(formData.stateOrigin)} disabled={!formData.stateOrigin} />
              
              <DataInput label="Town/Village" id="town" value={formData.town || ''} onChange={(v: string) => handleChange('town', v)} />
              <DataSelect label="Mode of ID" id="idMode" value={formData.idMode || ''} onChange={(v: string) => handleChange('idMode', v)} options={['NIN', 'Voters Card', 'Drivers License', 'International Passport']} />
              <DataInput label="Valid ID Number" id="idNumber" value={formData.idNumber || ''} onChange={(v: string) => handleChange('idNumber', v)} />
              <DataInput label="Email Address" id="email" type="email" value={formData.email || ''} onChange={(v: string) => handleChange('email', v)} />
              <DataInput label="Phone Number" id="phone" type="tel" value={formData.phone || ''} onChange={(v: string) => handleChange('phone', v)} />
              
              {/* Birth Details */}
              <DataInput label="Place of Birth" id="birthPlace" value={formData.birthPlace || ''} onChange={(v: string) => handleChange('birthPlace', v)} />
              <DataSelect label="State of Birth" id="birthState" value={formData.birthState || ''} onChange={(v: string) => handleChange('birthState', v)} options={ALL_STATES} />
              <DataSelect label="LGA of Birth" id="birthLga" value={formData.birthLga || ''} onChange={(v: string) => handleChange('birthLga', v)} options={getLgas(formData.birthState)} disabled={!formData.birthState} />
              
              {/* File Upload */}
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                <FileUpload label="Upload Affidavit*" id="affidavit" file={affidavitFile} isUploading={isUploading} onChange={handleFileUpload} />
              </div>
            </div>
          </section>

          {/* 2. Registration Details */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-gray-500" /> Registration Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataSelect label="Registration State (Resident)" id="regState" value={formData.regState || ''} onChange={(v: string) => handleChange('regState', v)} options={ALL_STATES} />
              <DataSelect label="Registration LGA" id="regLga" value={formData.regLga || ''} onChange={(v: string) => handleChange('regLga', v)} options={getLgas(formData.regState)} disabled={!formData.regState} />
              
              <DataInput label="Nearest Registration Center" id="regCenter" value={formData.regCenter || ''} onChange={(v: string) => handleChange('regCenter', v)} />
              <div className="md:col-span-2">
                <DataInput label="Current Residential Address" id="resAddress" value={formData.resAddress || ''} onChange={(v: string) => handleChange('resAddress', v)} />
              </div>
              <DataSelect label="Highest Education" id="education" value={formData.education || ''} onChange={(v: string) => handleChange('education', v)} options={['None', 'Primary', 'Secondary', 'Tertiary']} />
              <DataInput label="Occupation" id="occupation" value={formData.occupation || ''} onChange={(v: string) => handleChange('occupation', v)} />
              <div className="md:col-span-2">
                <DataInput label="Address of Place of Work" id="workAddress" value={formData.workAddress || ''} onChange={(v: string) => handleChange('workAddress', v)} />
              </div>
              <DataInput label="Reason for Request" id="reason" value={formData.reason || ''} onChange={(v: string) => handleChange('reason', v)} />
              <DataInput label="As a Requirement for" id="requirement" value={formData.requirement || ''} onChange={(v: string) => handleChange('requirement', v)} />
              <div className="md:col-span-2">
                <DataInput label="Address of Requesting Party" id="partyAddress" value={formData.partyAddress || ''} onChange={(v: string) => handleChange('partyAddress', v)} placeholder="Company, School, Embassy, etc." />
              </div>
            </div>
          </section>

          {/* 3. Father's Details */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-gray-500" /> Father's Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataInput label="Surname" id="fatherSurname" value={formData.fatherSurname || ''} onChange={(v: string) => handleChange('fatherSurname', v)} />
              <DataInput label="First Name" id="fatherFirst" value={formData.fatherFirst || ''} onChange={(v: string) => handleChange('fatherFirst', v)} />
              
              <DataSelect label="State of Origin" id="fatherState" value={formData.fatherState || ''} onChange={(v: string) => handleChange('fatherState', v)} options={ALL_STATES} />
              <DataSelect label="LGA of Origin" id="fatherLga" value={formData.fatherLga || ''} onChange={(v: string) => handleChange('fatherLga', v)} options={getLgas(formData.fatherState)} disabled={!formData.fatherState} />
              
              <DataInput label="Village/Town" id="fatherTown" value={formData.fatherTown || ''} onChange={(v: string) => handleChange('fatherTown', v)} />
            </div>
          </section>

          {/* 4. Mother's Details */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-gray-500" /> Mother's Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataInput label="Surname" id="motherSurname" value={formData.motherSurname || ''} onChange={(v: string) => handleChange('motherSurname', v)} />
              <DataInput label="First Name" id="motherFirst" value={formData.motherFirst || ''} onChange={(v: string) => handleChange('motherFirst', v)} />
              <DataInput label="Maiden Name" id="motherMaiden" value={formData.motherMaiden || ''} onChange={(v: string) => handleChange('motherMaiden', v)} />
              
              <DataSelect label="State of Origin" id="motherState" value={formData.motherState || ''} onChange={(v: string) => handleChange('motherState', v)} options={ALL_STATES} />
              <DataSelect label="LGA of Origin" id="motherLga" value={formData.motherLga || ''} onChange={(v: string) => handleChange('motherLga', v)} options={getLgas(formData.motherState)} disabled={!formData.motherState} />
              
              <DataInput label="Village/Town" id="motherTown" value={formData.motherTown || ''} onChange={(v: string) => handleChange('motherTown', v)} />
            </div>
          </section>

          {/* Submit */}
          <div className="pt-6 border-t border-gray-200">
            {submitError && <p className="mb-4 text-red-600 text-center font-medium bg-red-50 p-2 rounded">{submitError}</p>}
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full rounded-lg bg-blue-600 px-4 py-4 text-base font-bold text-white shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Processing...' : `Submit Application (Fee: ₦${serviceFee.toLocaleString()})`}
            </button>
          </div>

        </form>
      </div>

      {/* --- Confirmation Modal --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 p-4 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Please Confirm</h2>
              <button onClick={() => setIsConfirmModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-center text-gray-600 text-sm">
                Please confirm you have filled in the right details. <br/>
                <strong>This action is irreversible.</strong>
              </p>
              <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-center text-sm text-blue-600 font-medium">Total Charge</p>
                <p className="text-center text-2xl font-bold text-blue-700">₦{serviceFee.toLocaleString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-0 border-t border-gray-200">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-200"
              >
                CANCEL
              </button>
              <button
                onClick={handleFinalSubmit}
                className="py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                YES, SUBMIT
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
