/* ── MONEY FORMAT ── */
const TAX_EXCHANGE_RATE = 4000;
function formatTaxNumber(value) {
  return Number(value).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
}
function formatCurrencyPairFromKhr(khrAmount, currency) {
  const khr = Number(khrAmount) || 0;
  const usd = khr / TAX_EXCHANGE_RATE;
  return currency === 'USD'
    ? '$' + formatTaxNumber(usd) + ' (៛' + formatTaxNumber(khr) + ')'
    : '៛' + formatTaxNumber(khr) + '($' + formatTaxNumber(usd) + ')';
}
function formatCurrencyPair(amount, currency) {
  const numericAmount = Number(amount) || 0;
  const khr = currency === 'USD' ? numericAmount * TAX_EXCHANGE_RATE : numericAmount;
  return formatCurrencyPairFromKhr(khr, currency);
}

/* ── TAX CONFIG ── */
const taxCfg = {
  salary:{
    name:'Salary Tax (TOS)',
    about:'Monthly Cambodia salary tax for resident and non-resident employees. Resident employees may claim dependent deductions before progressive rates apply; non-residents are taxed at 20% with no dependent deductions.',
    formula:'Currency type: KHR or USD\nExchange rate: 1 USD = 4,000 KHR\n\nResident employees:\nDependent child deduction: 150,000 KHR each\nUnemployed spouse deduction: 150,000 KHR\nTaxable income = Gross salary in KHR + Taxable benefits - Exempt allowances - Dependent deductions\n\nResident brackets:\n0 - 1,500,000 KHR        → 0\n1,500,001 - 2,000,000    → Income x 5% - 75,000\n2,000,001 - 8,500,000    → Income x 10% - 175,000\n8,500,001 - 12,500,000   → Income x 15% - 600,000\nAbove 12,500,000         → Income x 20% - 1,225,000\n\nNon-resident employees:\nTaxable income = Gross salary in KHR + Taxable benefits - Exempt allowances\nSalary tax = Taxable income x 20%',
    fields:[
      {id:'s_curr',label:'Currency type',type:'select',opts:[['KHR','KHR'],['USD','USD']]},
      {id:'s_sal',label:'Monthly gross salary',type:'number',ph:'e.g. 2500000'},
      {id:'s_status',label:'Employee status',type:'select',opts:[['resident','Resident'],['non_resident','Non-resident']]},
      {id:'s_children',label:'Dependent children',type:'number',ph:'e.g. 2',showWhen:{id:'s_status',value:'resident'}},
      {id:'s_spouse',label:'Spouse unemployed',type:'select',opts:[['no','No'],['yes','Yes']],showWhen:{id:'s_status',value:'resident'}},
      {id:'s_benefits',label:'Taxable benefits and allowances (KHR)',type:'number',ph:'e.g. 300000'},
      {id:'s_exempt',label:'Exempt allowances (KHR)',type:'number',ph:'e.g. 100000'}
    ],
    calc(v){
      const grossSalary=parseFloat(v.s_sal)||0;
      const currency=v.s_curr||'KHR';
      const fmt=n=>formatCurrencyPairFromKhr(n,currency);
      const salaryKhr=currency==='USD'?grossSalary*4000:grossSalary;
      const status=v.s_status||'resident';
      const benefits=Math.max(0,parseFloat(v.s_benefits)||0);
      const exemptAllowances=Math.max(0,parseFloat(v.s_exempt)||0);
      const children=status==='resident'?Math.max(0,parseInt(v.s_children,10)||0):0;
      const childrenDeduction=children*150000;
      const spouseDeduction=status==='resident' && v.s_spouse==='yes'?150000:0;
      const dependentDeductions=childrenDeduction+spouseDeduction;
      const totalDeductions=exemptAllowances+dependentDeductions;
      const taxableIncome=Math.max(0,salaryKhr+benefits-exemptAllowances-dependentDeductions);
      let tax=0;
      let bracket='Non-resident flat rate';
      let formula='Taxable income x 20%';
      if(status==='non_resident'){
        tax=taxableIncome*.20;
      }else if(taxableIncome<=1500000){
        tax=0;
        bracket='0 - 1,500,000 KHR @ 0%';
        formula='0';
      }else if(taxableIncome<=2000000){
        tax=taxableIncome*.05-75000;
        bracket='1,500,001 - 2,000,000 KHR @ 5%';
        formula='Income x 5% - 75,000';
      }else if(taxableIncome<=8500000){
        tax=taxableIncome*.10-175000;
        bracket='2,000,001 - 8,500,000 KHR @ 10%';
        formula='Income x 10% - 175,000';
      }else if(taxableIncome<=12500000){
        tax=taxableIncome*.15-600000;
        bracket='8,500,001 - 12,500,000 KHR @ 15%';
        formula='Income x 15% - 600,000';
      }else{
        tax=taxableIncome*.20-1225000;
        bracket='Above 12,500,000 KHR @ 20%';
        formula='Income x 20% - 1,225,000';
      }
      tax=Math.max(0,tax);
      const netSalary=salaryKhr+benefits+exemptAllowances-tax;
      return{
        rows:[
          ['Gross salary',fmt(salaryKhr)],
          ['Currency type',currency],
          ['Exchange rate','1 USD = 4,000 KHR'],
          ['Employee status',status==='non_resident'?'Non-resident':'Resident'],
          ['Taxable benefits and allowances',fmt(benefits)],
          ['Exempt allowances',fmt(exemptAllowances)],
          ['Dependent child deduction',fmt(childrenDeduction)],
          ['Unemployed spouse deduction',fmt(spouseDeduction)],
          ['Total deductions',fmt(totalDeductions)],
          ['Taxable income',fmt(taxableIncome)],
          ['Applicable tax bracket',bracket],
          ['Calculation formula',formula]
        ],
        final:['Salary tax payable',fmt(tax)],
        afterRows:[['Net salary after tax',fmt(netSalary)]],
        brkts:null
      };
    }
  },
  vat:{
    name:'Value Added Tax (VAT)',
    about:'Calculate regular VAT, reverse VAT when the price already includes tax, or Cambodia import VAT using CIF, customs duty, and optional specific tax.',
    formula:'Exchange rate: 1 USD = 4,000 KHR\nVAT : 10%\n\n1. Basic VAT Calculator (Price Excluded VAT)\nInputs: Price without VAT\nVAT = Price × 10%\nTotal = Price + VAT\n\n2. Reverse VAT Calculator (Price Included VAT)\nInput: Price with VAT included\nBase price = Price ÷ 1.1\nVAT = Price − Base price\n\n3. Import VAT Calculator (CIF-based - Cambodia)\nCustoms Duty = CIF × Duty Rate\nSpecific Tax = CIF × Specific Tax Rate\nTax Base = CIF + Customs Duty + Specific Tax\nVAT = Tax Base × 10%\nTotal Pay = Tax Base + VAT\n\nDuty rates:\n0% Raw materials / special goods\n7% Basic materials\n15% Intermediate goods\n35% Luxury / finished goods',
    fields:[
      {id:'v_curr',label:'Currency type',type:'select',opts:[['USD','USD'],['KHR','KHR']]},
      {id:'v_calc_type',label:'VAT calculator type',type:'select',opts:[
        ['basic','Basic VAT - price excluded VAT'],
        ['reverse','Reverse VAT - price included VAT'],
        ['import','Import VAT - CIF based']
      ]},
      {id:'v_price',label:'Price without VAT',type:'number',ph:'e.g. 1000',showWhen:{id:'v_calc_type',value:'basic'}},
      {id:'v_included_price',label:'Price with VAT included',type:'number',ph:'e.g. 1100',showWhen:{id:'v_calc_type',value:'reverse'}},
      {id:'v_cif',label:'CIF (Cost + Insurance + Freight)',type:'number',ph:'e.g. 10000',showWhen:{id:'v_calc_type',value:'import'}},
      {id:'v_import_type',label:'Import type / customs duty',type:'select',opts:[
        ['raw','0% - Raw materials / special goods'],
        ['basic','7% - Basic materials'],
        ['intermediate','15% - Intermediate goods'],
        ['luxury','35% - Luxury / finished goods']
      ],showWhen:{id:'v_calc_type',value:'import'}},
      {id:'v_specific_rate',label:'Specific tax rate (%) optional',type:'number',ph:'e.g. 0, 10, 30',showWhen:{id:'v_calc_type',value:'import'}}
    ],
    calc(v){
      const money=(amount,currency)=>formatCurrencyPair(amount,currency);
      const currency=v.v_curr||'USD';
      const calcType=v.v_calc_type||'basic';
      if(calcType==='basic'){
        const price=parseFloat(v.v_price);
        if(!Number.isFinite(price) || price<=0) return {error:'Please enter a positive numeric price without VAT.'};
        const vatRate=.10;
        const vatAmount=price*vatRate;
        const total=price+vatAmount;
        return{
          rows:[
            ['Calculator Type','Basic VAT (Price Excluded VAT)'],
            ['Price without VAT',money(price,currency)],
            ['VAT Rate',(vatRate*100).toFixed(2).replace(/\.00$/,'')+'%'],
            ['Formula Used','VAT = Price × 10%; Total = Price + VAT'],
            ['VAT Amount',money(vatAmount,currency)]
          ],
          final:['Total Price',money(total,currency)],
          brkts:null
        };
      }
      if(calcType==='reverse'){
        const includedPrice=parseFloat(v.v_included_price);
        if(!Number.isFinite(includedPrice) || includedPrice<=0) return {error:'Please enter a positive numeric price with VAT included.'};
        const basePrice=includedPrice/1.1;
        const vatAmount=includedPrice-basePrice;
        return{
          rows:[
            ['Calculator Type','Reverse VAT (Price Included VAT)'],
            ['Price with VAT included',money(includedPrice,currency)],
            ['Formula Used','Base price = Price ÷ 1.1; VAT = Price − Base price'],
            ['Base Price',money(basePrice,currency)]
          ],
          final:['VAT Amount',money(vatAmount,currency)],
          brkts:null
        };
      }
      const cif=parseFloat(v.v_cif);
      if(!Number.isFinite(cif) || cif<=0) return {error:'Please enter a positive numeric CIF amount.'};
      const dutyRates={
        raw:{label:'Raw materials / special goods',rate:0},
        basic:{label:'Basic materials',rate:.07},
        intermediate:{label:'Intermediate goods',rate:.15},
        luxury:{label:'Luxury / finished goods',rate:.35}
      };
      const selected=dutyRates[v.v_import_type]||dutyRates.raw;
      const specificRateInput=parseFloat(v.v_specific_rate);
      const specificRate=Number.isFinite(specificRateInput) && specificRateInput>0 ? specificRateInput/100 : 0;
      const customsDuty=cif*selected.rate;
      const specificTax=cif*specificRate;
      const taxBase=cif+customsDuty+specificTax;
      const vatAmount=taxBase*.10;
      const totalPay=taxBase+vatAmount;
      return{
        rows:[
          ['Calculator Type','Import VAT (CIF-based - Cambodia)'],
          ['CIF',money(cif,currency)],
          ['Import Type',selected.label],
          ['Duty Rate',(selected.rate*100).toFixed(0)+'%'],
          ['Customs Duty',money(customsDuty,currency)],
          ['Specific Tax Rate',(specificRate*100).toFixed(2).replace(/\.00$/,'')+'%'],
          ['Specific Tax Amount',money(specificTax,currency)],
          ['Tax Base',money(taxBase,currency)],
          ['VAT (10%)',money(vatAmount,currency)]
        ],
        final:['Total Pay',money(totalPay,currency)],
        brkts:null
      };
    }
  },
  top:{
    name:'Prepayment Tax (PTOI)',
    about:'Prepayment Tax is calculated by applying 1% to monthly revenue.',
    formula:'Exchange rate: 1 USD = 4,000 KHR\n\nPrepayment Tax = Monthly Revenue × 1%',
    fields:[
      {id:'it_curr',label:'Currency type',type:'select',opts:[['USD','USD'],['KHR','KHR']]},
      {id:'it_revenue',label:'Monthly revenue',type:'number',ph:'e.g. 10000'}
    ],
    calc(v){
      const currency=v.it_curr||'USD';
      const fmt=n=>formatCurrencyPairFromKhr(n,currency);
      const revenue=parseFloat(v.it_revenue)||0;
      const revenueKhr=currency==='USD'?revenue*4000:revenue;
      const prepaymentTax=revenueKhr*.01;
      return{
        rows:[
          ['Revenue',fmt(revenueKhr)],
          ['Applicable rate','1%'],
          ['Prepayment tax amount',fmt(prepaymentTax)]
        ],
        final:['Total Prepayment payable',fmt(prepaymentTax)],
        brkts:null
      };
    }
  },
  wht:{
    name:'Withholding Tax (WHT)',
    about:'Withholding Tax is deducted at the time of payment for specific transactions. It applies to payment categories, not annual income.',
    formula:'Exchange rate: 1 USD = 4,000 KHR\n\nResident payments:\nServices                       → 15%\nRoyalties                      → 15%\nInterest (non-bank cases)      → 15%\nSale of assets / capital gains → 10%\nBank fixed-term deposits       → 6%\nBank regular savings           → 4%\n\nNon-resident payments:\nAll Cambodia-sourced payments  → 14%',
    fields:[
      {id:'w_curr',label:'Currency type',type:'select',opts:[['KHR','KHR'],['USD','USD']]},
      {id:'w_residency',label:'Recipient residency',type:'select',opts:[['resident','Resident'],['non_resident','Non-resident']]},
      {id:'w_type',label:'Payment type',type:'select',opts:[
        ['services','Services - 15%'],
        ['royalties','Royalties - 15%'],
        ['interest','Interest (non-bank cases) - 15%'],
        ['asset_sale','Sale of assets / capital gains - 10%'],
        ['fixed_deposit','Bank fixed-term deposits - 6%'],
        ['savings','Bank regular savings - 4%']
      ],showWhen:{id:'w_residency',value:'resident'}},
      {id:'w_nonresident_type',label:'Payment type',type:'select',opts:[['cambodia_sourced','All Cambodia-sourced payments - 14%']],showWhen:{id:'w_residency',value:'non_resident'}},
      {id:'w_amt',label:'Payment amount',type:'number',ph:'e.g. 1000000'}
    ],
    calc(v){
      const amount=parseFloat(v.w_amt)||0;
      const currency=v.w_curr||'KHR';
      const fmt=n=>formatCurrencyPairFromKhr(n,currency);
      const amountKhr=currency==='USD'?amount*4000:amount;
      const residency=v.w_residency||'resident';
      const type=v.w_type||'services';
      const residentRates={
        services:{label:'Services',rate:.15,rateLabel:'15%'},
        royalties:{label:'Royalties',rate:.15,rateLabel:'15%'},
        interest:{label:'Interest (non-bank cases)',rate:.15,rateLabel:'15%'},
        asset_sale:{label:'Sale of assets / capital gains',rate:.10,rateLabel:'10%'},
        fixed_deposit:{label:'Bank fixed-term deposits',rate:.06,rateLabel:'6%'},
        savings:{label:'Bank regular savings',rate:.04,rateLabel:'4%'}
      };
      const selected=residency==='non_resident'
        ? {label:'All Cambodia-sourced payments',rate:.14,rateLabel:'14%'}
        : (residentRates[type]||residentRates.services);
      const rate=selected.rate;
      const tax=amountKhr*rate;
      const net=amountKhr-tax;
      return{
        rows:[
          ['Payment amount',fmt(amountKhr)],
          ['Recipient residency',residency==='non_resident'?'Non-resident':'Resident'],
          ['Payment type',selected.label],
          ['Tax rate applied',selected.rateLabel],
          ['Withholding tax amount',fmt(tax)],
          ['Net amount received',fmt(net)]
        ],
        final:['Tax remitted to government',fmt(tax)],
        brkts:null
      };
    }
  },
  mt:{
    name:'Minimum Tax',
    about:'Cambodian Minimum Tax is calculated by applying 1% to annual revenue.',
    formula:'Exchange rate: 1 USD = 4,000 KHR\n\nMinimum Tax = Annual Revenue × 1%',
    fields:[
      {id:'mt_curr',label:'Currency type',type:'select',opts:[['KHR','KHR'],['USD','USD']]},
      {id:'mt_rev',label:'Annual revenue',type:'number',ph:'e.g. 100000000'}
    ],
    calc(v){
      const revenue=parseFloat(v.mt_rev)||0;
      const currency=v.mt_curr||'KHR';
      const fmt=n=>formatCurrencyPairFromKhr(n,currency);
      const revenueKhr=currency==='USD'?revenue*4000:revenue;
      const minimumTax=revenueKhr*.01;
      const finalTax=minimumTax;
      return{
        rows:[
          ['Revenue',fmt(revenueKhr)],
          ['Applicable rate','1%'],
          ['Minimum tax amount',fmt(minimumTax)]
        ],
        final:['Final minimum tax payable',fmt(finalTax)],
        brkts:null
      };
    }
  },
  toi:{
    name:'Income Tax',
    about:'Annual Cambodian Income Tax calculator for big companies, insurance companies, and individuals or small businesses. USD values are converted at 1 USD = 4,000 KHR.',
    formula:'Exchange rate: 1 USD = 4,000 KHR\n\nBig Company:\nStandard company       → 20% of net profit\nOil/Gas/Mining         → 30% of net profit\nQIP                    → 0% / special exemption\n\nInsurance:\nGeneral insurance      → 5% of gross premium income\nLife insurance         → 20% of profit\n\nIndividual / Small Business annual brackets:\n0 – 18,000,000           → 0%\n18,000,001 – 24,000,000  → 5%\n24,000,001 – 102,000,000 → 10%\n102,000,001 – 150,000,000 → 15%\n> 150,000,000            → 20%\n\nNo deductions, dependents, or PTOI credits are included.',
    fields:[
      {id:'toi_tax_type',label:'Tax type',type:'select',opts:[['company','Big Company'],['insurance','Insurance'],['individual','Individual / Small Business']]},
      {id:'toi_enterprise',label:'Enterprise type',type:'select',opts:[['standard','Standard'],['oil_gas_mining','Oil-Gas-Mining'],['qip','QIP']],showWhen:{id:'toi_tax_type',value:'company'}},
      {id:'toi_insurance',label:'Insurance type',type:'select',opts:[['general','General insurance'],['life','Life insurance']],showWhen:{id:'toi_tax_type',value:'insurance'}},
      {id:'toi_amount',label:'Annual income or profit',type:'number',ph:'e.g. 100000000'},
      {id:'toi_curr',label:'Currency type',type:'select',opts:[['KHR','KHR'],['USD','USD']]}
    ],
    calc(v){
      const amount=parseFloat(v.toi_amount)||0;
      const currency=v.toi_curr||'KHR';
      const fmt=n=>formatCurrencyPairFromKhr(n,currency);
      const incomeKhr=currency==='USD'?amount*4000:amount;
      const taxType=v.toi_tax_type||'company';
      let applied='Big Company - Standard';
      let rateLabel='20% flat';
      let tax=0;
      let brkts=null;
      if(taxType==='company'){
        const enterprise=v.toi_enterprise||'standard';
        const rates={standard:.20,oil_gas_mining:.30,qip:0};
        const labels={standard:'Big Company - Standard',oil_gas_mining:'Big Company - Oil/Gas/Mining',qip:'Big Company - QIP exemption'};
        applied=labels[enterprise]||labels.standard;
        tax=incomeKhr*(rates[enterprise]??.20);
        rateLabel=enterprise==='qip'?'0% / special exemption':((rates[enterprise]??.20)*100)+'% flat';
      }else if(taxType==='insurance'){
        const insurance=v.toi_insurance||'general';
        const rate=insurance==='life'?.20:.05;
        applied=insurance==='life'?'Insurance - Life insurance':'Insurance - Property / General insurance';
        rateLabel=insurance==='life'?'20% of profit':'5% of gross premium income';
        tax=incomeKhr*rate;
      }else{
        applied='Individual / Small Business';
        rateLabel='0% - 20% progressive';
        const bands=[
          {label:'0 - 18,000,000 KHR @ 0%',limit:18000000,rate:0},
          {label:'18,000,001 - 24,000,000 KHR @ 5%',limit:6000000,rate:.05},
          {label:'24,000,001 - 102,000,000 KHR @ 10%',limit:78000000,rate:.10},
          {label:'102,000,001 - 150,000,000 KHR @ 15%',limit:48000000,rate:.15},
          {label:'Above 150,000,000 KHR @ 20%',limit:Infinity,rate:.20}
        ];
        let remaining=incomeKhr;
        brkts=bands.map(b=>{
          const taxableInBand=Math.max(0,Math.min(remaining,b.limit));
          const bracketTax=taxableInBand*b.rate;
          tax+=bracketTax;
          remaining-=taxableInBand;
          return {
            l:b.label+' | taxable '+fmt(taxableInBand),
            u:fmt(bracketTax),
            hit:taxableInBand>0,
            amt:bracketTax
          };
        });
      }
      return{
        rows:[
          ['Income',fmt(incomeKhr)],
          ['Tax Type Applied',applied],
          ['Tax Rate(s)',rateLabel]
        ],
        final:['Total Income Tax',fmt(tax)],
        afterRows:[['Net Income After Tax',fmt(incomeKhr-tax)]],
        brkts
      };
    }
  },
  patent:{
    name:'Patent Tax',
    about:'Patent Tax is an annual Cambodian business registration tax. It is a business license tax, not an intellectual property patent tax, and is required even if the business has no profit.',
    formula:'Exchange rate: 1 USD = 4,000 KHR\n\nAnnual fixed fee by taxpayer class:\n\nSmall Taxpayer (Annual Turnover: 250 million - 700 million KHR)\nPatent Tax: 400,000 KHR\n\nMedium Taxpayer (Annual Turnover: 700 million - 4,000 million KHR)\nPatent Tax: 1,200,000 KHR\n\nLarge Taxpayer (Annual Turnover: 4,000 million - 10,000 million KHR)\nPatent Tax: 3,000,000 KHR\n\nLarge Taxpayer (Annual Turnover: Over 10,000 million KHR)\nPatent Tax: 5,000,000 KHR\n\nCommencement Date for New Business:\nJanuary 1 - June 30:\nNew Business Patent Tax = Base New Business Patent Tax × 100%\n\nJuly 1 - December 31:\nNew Business Patent Tax = Base New Business Patent Tax × 50%',
    fields:[
      {id:'pat_size',label:'Business size',type:'select',opts:[['small','Small'],['medium','Medium'],['large','Large'],['large_high','Large (High Turnover)']]},
      {id:'pat_activities',label:'Number of business activities',type:'number',ph:'optional, e.g. 1'},
      {id:'pat_branches',label:'Number of branch locations',type:'number',ph:'optional, e.g. 1'},
      {id:'pat_curr',label:'Currency type',type:'select',opts:[['KHR','KHR'],['USD','USD']]}
    ],
    calc(v){
      const fees={small:400000,medium:1200000,large:3000000,large_high:5000000};
      const labels={small:'Small',medium:'Medium',large:'Large',large_high:'Large (High Turnover)'};
      const size=v.pat_size||'small';
      const currency=v.pat_curr||'KHR';
      const fmt=n=>formatCurrencyPairFromKhr(n,currency);
      const baseTax=fees[size]||fees.small;
      const activities=Math.max(1,parseInt(v.pat_activities,10)||1);
      const branches=Math.max(1,parseInt(v.pat_branches,10)||1);
      const registrations=activities*branches;
      const total=baseTax*registrations;
      return{
        rows:[
          ['Business size',labels[size]||labels.small],
          ['Base patent tax',fmt(baseTax)],
          ['Number of required registrations',registrations.toLocaleString()],
          ['Annual payment status','Paid annually from January to March']
        ],
        final:['Total patent tax payable',fmt(total)],
        brkts:null
      };
    }
  },
  property:{
    name:'Property Tax',
    about:'Choose one of three Cambodia property tax calculations: Tax on Immovable Property (TOIP), Unused Land Tax, or Rental Tax. USD values are converted at 1 USD = 4,000 KHR.',
    formula:'Exchange rate: 1 USD = 4,000 KHR\n\n1. Tax on Immovable Property (TOIP)\nProperty Tax= [(Tax Base × 80%)-25000$]x 0.1%\n\n2. Unused Land Tax\nTax = Tax Base × 2%\n\n3. Rental Tax\nTotal Rent = Monthly total rent amount\nResident Tax = Total Rent × 10%\nNon-resident Tax = Total Rent × 14%',
    fields:[
      {id:'prop_curr',label:'Currency type',type:'select',opts:[['KHR','KHR'],['USD','USD']]},
      {id:'prop_tax_type',label:'Property tax type',type:'select',opts:[['toip','Tax on Immovable Property (TOIP)'],['unused','Unused Land Tax'],['rental','Rental Tax']]},
      {id:'prop_val',label:'Assessed property / land value',type:'number',ph:'e.g. 500000000',showWhen:{id:'prop_tax_type',value:'toip'}},
      {id:'prop_unused_val',label:'Assessed unused land value',type:'number',ph:'e.g. 500000000',showWhen:{id:'prop_tax_type',value:'unused'}},
      {id:'prop_total_rent',label:'Monthly total rent amount',type:'number',ph:'e.g. 3000',showWhen:{id:'prop_tax_type',value:'rental'}},
      {id:'prop_taxpayer',label:'Taxpayer type',type:'select',opts:[['resident','Resident - 10%'],['non_resident','Non-resident - 14%']],showWhen:{id:'prop_tax_type',value:'rental'}}
    ],
    calc(v){
      const currency=v.prop_curr||'KHR';
      const fmt=n=>formatCurrencyPairFromKhr(n,currency);
      const toKhr=n=>currency==='USD'?n*4000:n;
      const taxType=v.prop_tax_type||'toip';
      if(taxType==='toip'){
        const taxBase=toKhr(parseFloat(v.prop_val)||0);
        const adjustedValue=taxBase*.80;
        const exemption=25000*4000;
        const taxableValue=Math.max(0,adjustedValue-exemption);
        const tax=taxableValue*.001;
        return{
          rows:[
            ['Property Tax Type','Tax on Immovable Property (TOIP)'],
            ['Tax Base',fmt(taxBase)],
            ['Formula Used','Property Tax= [(Tax Base × 80%)-25000$]x 0.1%'],
            ['Taxable Value',fmt(taxableValue)]
          ],
          final:['Property tax payable',fmt(tax)],
          brkts:null
        };
      }
      if(taxType==='unused'){
        const taxBase=toKhr(parseFloat(v.prop_unused_val)||0);
        const tax=taxBase*.02;
        return{
          rows:[
            ['Property Tax Type','Unused Land Tax'],
            ['Tax Base',fmt(taxBase)],
            ['Formula Used','Tax = Tax Base × 2%']
          ],
          final:['Unused land tax payable',fmt(tax)],
          brkts:null
        };
      }
      const totalRent=toKhr(parseFloat(v.prop_total_rent)||0);
      const taxpayer=v.prop_taxpayer||'resident';
      const rate=taxpayer==='non_resident'?.14:.10;
      const rateLabel=taxpayer==='non_resident'?'14%':'10%';
      const tax=totalRent*rate;
      return{
        rows:[
          ['Property Tax Type','Rental Tax'],
          ['Monthly total rent amount',fmt(totalRent)],
          ['Taxpayer Type',taxpayer==='non_resident'?'Non-resident':'Resident'],
          ['Formula Used',(taxpayer==='non_resident'?'Non-resident Tax':'Resident Tax')+' = Total Rent × '+rateLabel]
        ],
        final:['Rental tax payable',fmt(tax)],
        brkts:null
      };
    }
  },
  specific:{
    name:'Specific Tax System',
    about:'Calculate Cambodian specific tax for selected goods and services. Choose USD or KHR, select the goods or services category, choose the applicable tax type, then enter a positive invoice price.',
    formula:'Exchange rate: 1 USD = 4,000 KHR\n\nGoods (Specific Tax)\nProduct                      SPT Rate\nAlcohol / Spirits            35%\nBeer                         30%\nCigarettes                   20%\nCigars                       25%\nBeverages / Soft Drinks      10%\nCement                       5%\n\nFormula\nTax Base\nTax Base = 0.9 × ((Invoice Price ÷ 1.1) ÷ (1 + SPT Rate))\n\nSPT Amount\nSPT Amount = Tax Base × SPT Rate\n\nServices (Specific Tax)\nService                      SPT Rate\nAir Passenger Transport      10%\nEntertainment Services       10%\nTelecommunications           3%\n\nFormula\nTax Base\nTax Base = Invoice Price ÷ (1 + 10% + SPT Rate)\n\nSPT Amount\nSPT Amount = Tax Base × SPT Rate',
    fields:[
      {id:'sp_curr',label:'Choose currency',type:'select',opts:[['USD','USD'],['KHR','KHR']]},
      {id:'sp_category',label:'Tax category',type:'select',opts:[['goods','Goods'],['services','Services']]},
      {id:'sp_goods_type',label:'Goods tax type',type:'select',opts:[
        ['alcohol_spirits','Alcohol / Spirits - 35%'],
        ['beer','Beer - 30%'],
        ['cigarettes','Cigarettes - 20%'],
        ['cigars','Cigars - 25%'],
        ['soft_drinks','Beverages / Soft Drinks - 10%'],
        ['cement','Cement - 5%']
      ],showWhen:{id:'sp_category',value:'goods'}},
      {id:'sp_service_type',label:'Services tax type',type:'select',opts:[
        ['air_passenger','Air Passenger Transport - 10%'],
        ['entertainment','Entertainment Services - 10%'],
        ['telecommunications','Telecommunications - 3%']
      ],showWhen:{id:'sp_category',value:'services'}},
      {id:'sp_price',label:'Enter the Invoice Price',type:'number',ph:'e.g. 10000'}
    ],
    calc(v){
      const money=(amount,currency)=>formatCurrencyPair(amount,currency);
      const currency=v.sp_curr||'USD';
      const invoicePrice=parseFloat(v.sp_price);
      if(!Number.isFinite(invoicePrice) || invoicePrice<=0){
        return {error:'Please enter a positive numeric invoice price before calculating.'};
      }
      const category=v.sp_category||'goods';
      const goodsRates={
        alcohol_spirits:{label:'Alcohol / Spirits',rate:.35},
        beer:{label:'Beer',rate:.30},
        cigarettes:{label:'Cigarettes',rate:.20},
        cigars:{label:'Cigars',rate:.25},
        soft_drinks:{label:'Beverages / Soft Drinks',rate:.10},
        cement:{label:'Cement',rate:.05}
      };
      const serviceRates={
        air_passenger:{label:'Air Passenger Transport',rate:.10},
        entertainment:{label:'Entertainment Services',rate:.10},
        telecommunications:{label:'Telecommunications',rate:.03}
      };
      const selected=category==='services'
        ? (serviceRates[v.sp_service_type]||serviceRates.air_passenger)
        : (goodsRates[v.sp_goods_type]||goodsRates.alcohol_spirits);
      const rate=selected.rate;
      const taxBase=category==='services'
        ? invoicePrice/(1+.10+rate)
        : .9*((invoicePrice/1.1)/(1+rate));
      const tax=taxBase*rate;
      const rateLabel=(rate*100).toFixed(0)+'%';
      const categoryLabel=category==='services'?'Services':'Goods';
      const formula=category==='services'
        ? 'Tax Base = Invoice Price ÷ (1 + 10% + SPT Rate); Amount of SPT = Tax Base × SPT Rate'
        : 'Tax Base = 0.9 × ((Invoice Price ÷ 1.1) ÷ (1 + SPT Rate)); Amount of SPT = Tax Base × SPT Rate';
      return{
        rows:[
          ['Tax Category',categoryLabel],
          ['Tax Type',selected.label],
          ['Invoice Price',money(invoicePrice,currency)],
          ['SPT Rate',rateLabel],
          ['Formula Used',formula],
          ['Tax Base',money(taxBase,currency)]
        ],
        final:['Amount of SPT',money(tax,currency)],
        brkts:null
      };
    }
  },
  accommodation:{
    name:'Accommodation Tax',
    about:'Accommodation Tax is imposed at a rate of 2% on accommodation services provided in Cambodia. The calculator supports VAT-exclusive and VAT-inclusive invoice prices.',
    formula:'Exchange rate: 1 USD = 4,000 KHR\n\nAccommodation Tax Rate: 2%\n\nExcluding VAT\nAccommodation Tax = Invoice Price × 2%\n\nIncluding VAT\nTax Base = Invoice Price ÷ 1.12\nAccommodation Tax = Tax Base × 2%',
    fields:[
      {id:'a_curr',label:'Choose currency',type:'select',opts:[['USD','USD'],['KHR','KHR']]},
      {id:'a_method',label:'Tax method',type:'select',opts:[['exclude_vat','Excluding VAT'],['include_vat','Including VAT']]},
      {id:'a_invoice_price',label:'Invoice price',type:'number',ph:'e.g. 100'}
    ],
    calc(v){
      const money=(amount,currency)=>formatCurrencyPair(amount,currency);
      const currency=v.a_curr||'USD';
      const method=v.a_method||'exclude_vat';
      const invoicePrice=parseFloat(v.a_invoice_price);
      if(!Number.isFinite(invoicePrice) || invoicePrice<=0){
        return {error:'Please enter a positive invoice price before calculating.'};
      }
      const rate=.02;
      const includesVat=method==='include_vat';
      const taxBase=includesVat?invoicePrice/1.12:invoicePrice;
      const tax=taxBase*rate;
      const rows=[
        ['Tax Method',includesVat?'Including VAT':'Excluding VAT'],
        ['Invoice Price',money(invoicePrice,currency)]
      ];
      if(includesVat) rows.push(['Tax Base',money(taxBase,currency)]);
      rows.push(
        ['Accommodation Tax Rate','2%'],
        ['Formula Used',includesVat?'Tax Base = Invoice Price ÷ 1.12; Accommodation Tax = Tax Base × 2%':'Accommodation Tax = Invoice Price × 2%']
      );
      return{
        rows,
        final:['Accommodation Tax Amount',money(tax,currency)],
        brkts:null
      };
    }
  },
  transfer:{
    name:'Transfer Tax (Stamp Duty)',
    about:'Choose one of five transfer types: Land Concession, General Property Transfer, First-time Transfer, Second-time Transfer, or Buy / Sell. Family, gift, and inheritance cases apply the deductions in the selected rule.',
    formula:'Exchange rate: 1 USD = 4,000 KHR\n\n1. Land Concession\nTransfer Tax = 0%\n\n2. General Property Transfer\nTax = Tax Base × 4%\n\n3. First-time Transfer\nDirect family + full ownership transfer: Tax = 0%\nGift, non-direct family: Tax = (Tax Base × 4%) - 4,000,000 KHR\nInheritance, non-direct family: Tax = (Tax Base × 4%) - 8,000,000 KHR\n\n4. Second-time Transfer\nApplies only to gift within family circle.\nAny 2nd transfer onward, including partial ownership, is treated as Second-time Transfer.\nTransfer Tax = (Tax Base × Transfer Share × 4%) - 4,000,000 KHR\nExample 50% share: (Tax Base × 50% × 4%) - 4,000,000 KHR\n\n5. Buy / Sell\nTax = Tax Base × 4%',
    fields:[
      {id:'tr_curr',label:'Currency type',type:'select',opts:[['KHR','KHR'],['USD','USD']]},
      {id:'tr_transfer_type',label:'Transfer type',type:'select',opts:[
        ['land_concession','Land Concession'],
        ['general','General property transfer'],
        ['first_time','First-time Transfer'],
        ['second_time','Second-time Transfer'],
        ['buy_sell','Buy / Sell']
      ]},
      {id:'tr_tax_base',label:'Tax Base',type:'number',ph:'e.g. 500000000'},
      {id:'tr_first_case',label:'First-time transfer relationship / case',type:'select',opts:[
        ['direct_family','Direct family - full ownership transfer'],
        ['gift_non_direct','Gift - non-direct family'],
        ['inheritance_non_direct','Inheritance - non-direct family']
      ],showWhen:{id:'tr_transfer_type',value:'first_time'}},
      {id:'tr_direct_relation',label:'Direct family relationship',type:'select',opts:[
        ['parent_child','Parent ↔ Child'],
        ['spouse','Spouse ↔ Spouse'],
        ['grandparent_grandchild','Grandparent ↔ Grandchild'],
        ['parent_child_spouse','Parent → Child + Spouse (joint)'],
        ['grandparent_grandchild_spouse','Grandparent → Grandchild + Spouse']
      ],showWhen:{all:[{id:'tr_transfer_type',value:'first_time'},{id:'tr_first_case',value:'direct_family'}]}},
      {id:'tr_gift_relation',label:'Gift non-direct family relationship',type:'select',opts:[
        ['parent_in_law_child_in_law','Parent-in-law ↔ Child-in-law'],
        ['sibling','Sibling']
      ],showWhen:{all:[{id:'tr_transfer_type',value:'first_time'},{id:'tr_first_case',value:'gift_non_direct'}]}},
      {id:'tr_inheritance_relation',label:'Inheritance non-direct family relationship',type:'select',opts:[
        ['parent_in_law_child_in_law','Parent-in-law ↔ Child-in-law'],
        ['sibling','Sibling']
      ],showWhen:{all:[{id:'tr_transfer_type',value:'first_time'},{id:'tr_first_case',value:'inheritance_non_direct'}]}},
      {id:'tr_second_relation',label:'Second-time family relationship',type:'select',opts:[
        ['parent_child','Parent ↔ Child'],
        ['spouse','Spouse ↔ Spouse'],
        ['grandparent_grandchild','Grandparent ↔ Grandchild'],
        ['parent_child_spouse','Parent → Child + Spouse (joint)'],
        ['grandparent_grandchild_spouse','Grandparent → Grandchild + Spouse']
      ],showWhen:{id:'tr_transfer_type',value:'second_time'}},
      {id:'tr_transfer_share',label:'Transferred ownership share (%)',type:'number',ph:'e.g. 50 for half ownership',default:'100',showWhen:{all:[{id:'tr_transfer_type',value:'second_time'},{id:'tr_second_relation',value:'parent_child_spouse'}]}}
    ],
    calc(v){
      const currency=v.tr_curr||'KHR';
      const fmt=n=>formatCurrencyPairFromKhr(n,currency);
      const toKhr=n=>currency==='USD'?n*4000:n;
      const transferType=v.tr_transfer_type||'land_concession';
      const labels={
        land_concession:'Land Concession',
        general:'General property transfer',
        first_time:'First-time Transfer',
        second_time:'Second-time Transfer',
        buy_sell:'Buy / Sell'
      };
      const taxBase=toKhr(parseFloat(v.tr_tax_base)||0);
      const grossTax=taxBase*.04;
      const relationLabels={
        parent_child:'Parent ↔ Child',
        spouse:'Spouse ↔ Spouse',
        grandparent_grandchild:'Grandparent ↔ Grandchild',
        parent_child_spouse:'Parent → Child + Spouse (joint)',
        grandparent_grandchild_spouse:'Grandparent → Grandchild + Spouse',
        parent_in_law_child_in_law:'Parent-in-law ↔ Child-in-law',
        sibling:'Sibling'
      };
      let deduction=0;
      let tax=0;
      let rateLabel='4%';
      let rule='Tax = Tax Base × 4%';
      let caseLabel='Not applicable';
      let relationshipLabel='Not applicable';
      let taxableTransferBase=taxBase;
      let treatment='Standard transfer tax';

      if(transferType==='land_concession'){
        rateLabel='0%';
        rule='Transfer Tax = 0%';
        treatment='Land concession transfer is taxed at 0%';
      }else if(transferType==='first_time'){
        const firstCase=v.tr_first_case||'direct_family';
        const firstLabels={
          direct_family:'Direct family - full ownership transfer',
          gift_non_direct:'Gift - non-direct family',
          inheritance_non_direct:'Inheritance - non-direct family'
        };
        caseLabel=firstLabels[firstCase]||firstLabels.direct_family;
        if(firstCase==='direct_family'){
          relationshipLabel=relationLabels[v.tr_direct_relation]||relationLabels.parent_child;
          rateLabel='0%';
          rule='Direct family full ownership transfer: Tax = 0%';
          treatment='Full ownership transfer within selected direct family relationship';
        }else if(firstCase==='gift_non_direct'){
          relationshipLabel=relationLabels[v.tr_gift_relation]||relationLabels.parent_in_law_child_in_law;
          deduction=4000000;
          tax=Math.max(0,grossTax-deduction);
          rule='Tax = (Tax Base × 4%) - 4,000,000 KHR';
          treatment='Gift between selected non-direct family relationship';
        }else{
          relationshipLabel=relationLabels[v.tr_inheritance_relation]||relationLabels.parent_in_law_child_in_law;
          deduction=8000000;
          tax=Math.max(0,grossTax-deduction);
          rule='Tax = (Tax Base × 4%) - 8,000,000 KHR';
          treatment='Inheritance between selected non-direct family relationship';
        }
      }else if(transferType==='second_time'){
        const shareInput=parseFloat(v.tr_transfer_share);
        const secondRelation=v.tr_second_relation||'parent_child';
        const transferShare=secondRelation==='parent_child_spouse' && Number.isFinite(shareInput) && shareInput>0 ? Math.min(100, shareInput) / 100 : 1;
        relationshipLabel=relationLabels[secondRelation]||relationLabels.parent_child;
        taxableTransferBase=taxBase*transferShare;
        const secondGrossTax=taxableTransferBase*.04;
        caseLabel='Gift within family circle - 2nd transfer onward';
        deduction=4000000;
        tax=Math.max(0,secondGrossTax-deduction);
        rule='Tax = (Tax Base × '+(transferShare*100).toFixed(2).replace(/\.00$/,'')+'% × 4%) - 4,000,000 KHR';
        treatment='Any subsequent family gift transfer, including partial ownership, is treated as Second-time Transfer';
      }else{
        tax=grossTax;
      }
      const summaryRows=[
        ['Transfer Type',labels[transferType]||labels.land_concession],
        ['Tax Base',fmt(taxBase)]
      ];
      if(caseLabel!=='Not applicable') summaryRows.push(['Selected Case',caseLabel]);
      if(relationshipLabel!=='Not applicable') summaryRows.push(['Relationship',relationshipLabel]);
      return{
        rows:summaryRows,
        final:['Transfer Tax Payable',fmt(tax)],
        brkts:null
      };
    }
  }
};

/* ── MODAL DATA ── */
const modalInfo = {
  salary:{tag:'TOS',tc:'st-blue',title:'Salary Tax (TOS)',body:'Monthly salary tax is calculated by employee residency. Salary can be entered in KHR or USD; USD salary is converted at 1 USD = 4,000 KHR before resident or non-resident tax rules are applied.',formula:'Currency type: KHR or USD\nMonthly gross salary: entered value\nExchange rate: 1 USD = 4,000 KHR\n\nResident employees:\nEach dependent child: 150,000 KHR\nUnemployed spouse: 150,000 KHR\n\n0 - 1,500,000 KHR → 0\n1,500,001 - 2,000,000 → Income x 5% - 75,000\n2,000,001 - 8,500,000 → Income x 10% - 175,000\n8,500,001 - 12,500,000 → Income x 15% - 600,000\nAbove 12,500,000 → Income x 20% - 1,225,000\n\nNon-resident employees:\nSalary tax = Taxable income x 20%',example:'Resident gross salary KHR 4,800,000\nUnemployed spouse + 2 children = KHR 450,000 deduction\nTaxable income = KHR 4,350,000\nTax = KHR 260,000\nNet salary = KHR 4,540,000'},
  vat:{tag:'VAT',tc:'st-green',title:'Value Added Tax',body:'VAT can be calculated from a price excluding VAT, reversed from a VAT-included price, or calculated for Cambodia imports using CIF, customs duty, and optional specific tax.',formula:'Exchange rate: 1 USD = 4,000 KHR\nVAT : 10%\n\nBasic VAT (Price Excluded VAT)\nVAT = Price × 10%\nTotal = Price + VAT\n\nReverse VAT (Price Included VAT)\nBase price = Price ÷ 1.1\nVAT = Price − Base price\n\nImport VAT (CIF-based - Cambodia)\n0% Raw materials / special goods\n7% Basic materials\n15% Intermediate goods\n35% Luxury / finished goods\n\nCustoms Duty = CIF × Duty Rate\nSpecific Tax = CIF × Specific Tax Rate\nTax Base = CIF + Customs Duty + Specific Tax\nVAT = Tax Base × 10%\nTotal Pay = Tax Base + VAT',example:'Price USD 100 without VAT:\nVAT = USD 10.00\nTotal = USD 110.00'},
  top:{tag:'PTOI',tc:'st-amber',title:'Prepayment Tax (PTOI)',body:'Prepayment Tax is calculated by applying 1% to monthly revenue.\n\nUSD revenue is converted at 1 USD = 4,000 KHR before the rate is applied.',formula:'Revenue_KHR = Revenue × 4,000 when currency is USD\nRevenue_KHR = Revenue when currency is KHR\n\nPrepayment Tax = Revenue_KHR × 1%',example:'Monthly revenue KHR 40,000,000\nPrepayment Tax = KHR 400,000\nTotal Prepayment payable = KHR 400,000'},
  wht:{tag:'WHT',tc:'st-purple',title:'Withholding Tax (WHT)',body:'Withholding Tax is deducted at the time of payment and applies to specific transactions rather than annual income. Rates depend on the selected payment type.\n\nUSD payments are converted at 1 USD = 4,000 KHR before tax is calculated.',formula:'Resident payments:\nServices: 15%\nRoyalties: 15%\nInterest (non-bank cases): 15%\nSale of assets / capital gains: 10%\nBank fixed-term deposits: 6%\nBank regular savings: 4%\n\nNon-resident payments:\nAll Cambodia-sourced payments: 14%',example:'Resident royalty payment KHR 10,000,000\nWHT = KHR 1,500,000\nNet received = KHR 8,500,000'},
  mt:{tag:'MT',tc:'st-teal',title:'Minimum Tax',body:'Minimum Tax is calculated by applying 1% to annual revenue.\n\nUSD revenue is converted at 1 USD = 4,000 KHR before the rate is applied.',formula:'Revenue_KHR = Revenue × 4,000 when currency is USD\nRevenue_KHR = Revenue when currency is KHR\n\nMinimum Tax = Revenue_KHR × 1%',example:'Annual revenue KHR 100,000,000\nMinimum Tax = KHR 1,000,000\nFinal payable = KHR 1,000,000'},
  toi:{tag:'INC',tc:'st-red',title:'Income Tax',body:'Annual Cambodian Income Tax has three separate cases. Big companies apply a flat rate on net profit, insurance companies apply special rates, and individuals or small businesses use progressive annual KHR brackets.\n\nThe calculator converts USD at 1 USD = 4,000 KHR and applies only the selected category. No deductions, dependents, or PTOI credits are included.',formula:'Big Company:\nStandard: 20%\nOil/Gas/Mining: 30%\nQIP: 0% / special exemption\n\nInsurance:\nProperty / General insurance: 5% of gross premium income\nLife insurance: 20% of profit\n\nIndividual annual brackets:\n0 - 18,000,000 → 0%\n18,000,001 - 24,000,000 → 5%\n24,000,001 - 102,000,000 → 10%\n102,000,001 - 150,000,000 → 15%\nAbove 150,000,000 → 20%',example:'Individual income KHR 120,000,000:\nTotal Income Tax = KHR 10,800,000\nNet Income After Tax = KHR 109,200,000'},
  patent:{tag:'PAT',tc:'st-gold',title:'Patent Tax',body:'Patent Tax is an annual Cambodian business registration tax paid by registered businesses. It is not related to intellectual property patents.\n\nIt is a fixed business license tax, paid annually from January to March, and may be required separately for additional business activities or branch locations.',formula:'Exchange rate: 1 USD = 4,000 KHR\n\nAnnual fixed fee by taxpayer class:\n\nSmall Taxpayer (Annual Turnover: 250 million - 700 million KHR)\nPatent Tax: 400,000 KHR\n\nMedium Taxpayer (Annual Turnover: 700 million - 4,000 million KHR)\nPatent Tax: 1,200,000 KHR\n\nLarge Taxpayer (Annual Turnover: 4,000 million - 10,000 million KHR)\nPatent Tax: 3,000,000 KHR\n\nLarge Taxpayer (Annual Turnover: Over 10,000 million KHR)\nPatent Tax: 5,000,000 KHR\n\nCommencement Date for New Business:\nJanuary 1 - June 30:\nNew Business Patent Tax = Base New Business Patent Tax × 100%\n\nJuly 1 - December 31:\nNew Business Patent Tax = Base New Business Patent Tax × 50%',example:'Medium taxpayer with 2 required registrations:\nKHR 1,200,000 × 2 = KHR 2,400,000'},
  property:{tag:'PROP',tc:'st-teal',title:'Property Tax',body:'Property Tax is calculated by selecting one of three cases: Tax on Immovable Property (TOIP), Unused Land Tax, or Rental Tax.\n\nUSD values are converted at 1 USD = 4,000 KHR before tax is calculated.',formula:'Exchange rate: 1 USD = 4,000 KHR\n\n1. Tax on Immovable Property (TOIP)\nProperty Tax= [(Tax Base × 80%)-25000$]x 0.1%\n\n2. Unused Land Tax\nTax = Tax Base × 2%\n\n3. Rental Tax\nTotal Rent = Monthly total rent amount\nResident Tax = Total Rent × 10%\nNon-resident Tax = Total Rent × 14%',example:'Select the property tax type, enter the tax base or rental details, then calculate the tax payable.'},
  specific:{tag:'ST',tc:'st-purple',title:'Specific Tax',body:'Specific Tax applies to selected goods and services, including listed goods categories and service categories with their own SPT rates.',formula:'Exchange rate: 1 USD = 4,000 KHR\n\nGoods (Specific Tax)\nProduct                      SPT Rate\nAlcohol / Spirits            35%\nBeer                         30%\nCigarettes                   20%\nCigars                       25%\nBeverages / Soft Drinks      10%\nCement                       5%\n\nFormula\nTax Base\nTax Base = 0.9 × ((Invoice Price ÷ 1.1) ÷ (1 + SPT Rate))\n\nSPT Amount\nSPT Amount = Tax Base × SPT Rate\n\nServices (Specific Tax)\nService                      SPT Rate\nAir Passenger Transport      10%\nEntertainment Services       10%\nTelecommunications           3%\n\nFormula\nTax Base\nTax Base = Invoice Price ÷ (1 + 10% + SPT Rate)\n\nSPT Amount\nSPT Amount = Tax Base × SPT Rate',example:'Beer invoice price USD 10,000.00\nTax base = USD 6,293.71\nSpecific Tax at 30% = USD 1,888.11'},
  accommodation:{tag:'AT',tc:'st-teal',title:'Accommodation Tax',body:'Accommodation Tax is imposed at a rate of 2% on accommodation services provided in Cambodia. The calculator supports VAT-exclusive and VAT-inclusive invoice prices.',formula:'Exchange rate: 1 USD = 4,000 KHR\n\nAccommodation Tax Rate: 2%\n\nExcluding VAT\nAccommodation Tax = Invoice Price × 2%\n\nIncluding VAT\nTax Base = Invoice Price ÷ 1.12\nAccommodation Tax = Tax Base × 2%',example:'Excluding VAT: Invoice Price USD 100.00\nAccommodation Tax = USD 100.00 × 2% = USD 2.00\n\nIncluding VAT: Invoice Price USD 112.00\nTax Base = USD 112.00 ÷ 1.12 = USD 100.00\nAccommodation Tax = USD 100.00 × 2% = USD 2.00'},
  transfer:{tag:'TRF',tc:'st-amber',title:'Transfer Tax (Stamp Duty)',body:'Transfer Tax is calculated by selecting one of five transfer types: Land Concession, General property transfer, First-time Transfer, Second-time Transfer, or Buy / Sell.',formula:'Land Concession:\nTransfer Tax = 0%\n\nGeneral property transfer:\nTax = Tax Base × 4%\n\nFirst-time Transfer:\nDirect family full ownership transfer = 0%\nGift, non-direct family = (Tax Base × 4%) - 4,000,000 KHR\nInheritance, non-direct family = (Tax Base × 4%) - 8,000,000 KHR\n\nSecond-time Transfer:\nGift within family circle from the 2nd transfer onward, including partial ownership\nTax = (Tax Base × Transfer Share × 4%) - 4,000,000 KHR\n\nBuy / Sell:\nTax = Tax Base × 4%',example:'Second-time family transfer of 50% share:\nTransfer tax = (tax base × 50% × 4%) - 4,000,000 KHR'}
};
