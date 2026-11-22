/**
 * Prop firm comparison data and the interactive table (sort, step/size/firm filters).
 * Static snapshot, edited by hand: re-check prices and codes before changing a row.
 */
type Crit = number | null;
interface Row {
  firm: string;
  plan: string;
  size: string;
  price: number;
  list: number;
  code: string;
  steps: number;
  c: Crit[];
  note: string;
  score: number;
  ppk: number;
}

// criteria: ea, copy own accounts, no consistency, static DD, few rules, swap-free, overnight/weekend, news -> 1 / .5 / 0 / null (unverified)
const R: Array<Omit<Row, "score" | "ppk">> = [];
function row(firm: string, plan: string, size: string, price: number, list: number, code: string, steps: number, c: Crit[], note: string) {
  R.push({ firm, plan, size, price, list, code, steps, c, note });
}
// The5ers
const T5: Crit[] = [1,1,1,1,.5,null,1,1], T5H: Crit[] = [1,1,1,1,.5,null,1,.5];
row("The5ers","Growth 1-Step","5K",52,52,"-",1,T5,"3% daily: pause or breach (sources disagree), 3 profitable days, 1:30");
row("The5ers","Growth 1-Step","10K",98,98,"-",1,T5,"same");
row("The5ers","Growth 1-Step","20K",189,189,"-",1,T5,"same, max $40K in evaluation");
row("The5ers","High Stakes 2-Step","2.5K",19,19,"-",2,T5H,"10%/5%, 10% static DD, news forbidden +-2 min");
row("The5ers","High Stakes 2-Step","5K",35,35,"-",2,T5H,"same");
row("The5ers","High Stakes 2-Step","10K",69,69,"-",2,T5H,"same");
row("The5ers","High Stakes 2-Step","25K",176,176,"-",2,T5H,"same");
row("The5ers","Bootcamp 3-Step","20K",72,72,"-",3,[1,.5,1,1,0,null,1,1],"$22 + $50 activation, mandatory SL");
row("FTMO","1-Step","10K",91,91,"-",1,[1,1,0,0,.5,0,.5,.5],"10% EOD trailing DD, Best Day 50%, no Swing (not re-read recently)");
row("FTMO","2-Step Standard","10K",102,102,"-",2,[1,1,1,1,.5,0,.5,.5],"10%/5%, 5% daily, 4 days per phase, funded: no news/weekend (not re-read)");
row("FTMO","2-Step Swing","10K",114,114,"-",2,[1,1,1,1,.5,0,1,1],"as Standard but news and weekend ok, leverage 1:30 (not re-read)");
row("FTMO","Instant","5K",194,194,"-",0,[null,null,0,0,.5,0,null,null],"EUR 169; 10% intraday trailing DD, 30% consistency, 3% daily");
const FN: Crit[] = [1,.5,.5,1,.5,.5,1,.5], FNI: Crit[] = [1,.5,1,0,.5,.5,1,.5];
row("FundedNext","Stellar 1-Step","6K",56.59,65.99,"FNTRICK (Oct)",1,FN,"$44.99 + swap-free $6.60 + EA $5. 10%, 6% static DD, 3% daily closes, news 40% on funded");
row("FundedNext","Stellar 1-Step","15K",121.99,129.99,"FNTRICK (Oct)",1,FN,"$103.99 + SF $13 + EA $5 (EA only: $108.99). 10%, 6% static DD");
row("FundedNext","Stellar 2-Step","6K",45.99,59.99,"FNTRICK (Oct)",2,FN,"$34.99 + SF $6 + EA $5. 8%/5%, 10% DD, 5 days");
row("FundedNext","Stellar 2-Step","15K",112.99,119.99,"FNTRICK (Oct)",2,FN,"$95.99 + SF $12 + EA $5. 8%/5%, 10% DD, 5% daily");
row("FundedNext","Stellar 2-Step","25K",184.99,199.99,"FNTRICK (Oct)",2,FN,"$159.99 + SF $20 + EA $5");
row("FundedNext","Stellar Lite 2-Step","5K",38.29,32.99,"FNTRICK (Oct)",2,FN,"$29.99 + SF $3.30 + EA $5. 8%/4%, 8% DD, 4% daily, 5 days");
row("FundedNext","Stellar Lite 2-Step","10K",58.99,59.99,"FNTRICK (Oct)",2,FN,"$47.99 + SF $6 + EA $5");
row("FundedNext","Stellar Lite 2-Step","25K",130.99,139.99,"FNTRICK (Oct)",2,FN,"$111.99 + SF $14 + EA $5");
row("FundedNext","Stellar Instant","2K",60.99,59.99,"FNTRICK (Oct)",0,FNI,"$49.99 + SF $6 + EA $5. 6% trailing DD, no daily");
row("FundedNext","Stellar Instant","5K",139.99,149.99,"FNTRICK (Oct)",0,FNI,"$119.99 + SF $15 + EA $5");
const TFC: Crit[] = [1,1,1,1,.5,0,1,.5], TFD: Crit[] = [1,1,.5,0,.5,0,1,.5], TFI: Crit[] = [1,1,0,0,.5,0,1,.5];
row("Tradeify FX","Classic 2-Step","5K",28,55,"MILK -50%",2,TFC,"read. 5%/10%, 3% daily, 10% static DD, no consistency, own EAs only");
row("Tradeify FX","Classic 2-Step","10K",55,109,"MILK -50%",2,TFC,"read. same");
row("Tradeify FX","Classic 2-Step","25K",125,249,"MILK -50%",2,TFC,"read. same");
row("Tradeify FX","Daily 1-Step","10K",45,89,"MILK -50%",1,TFD,"calculated (list -50%). 10%, no daily loss, 5% trailing DD on closed balance, 40% consistency in evaluation only");
row("Tradeify FX","Daily 1-Step","25K",75,149,"MILK -50%",1,TFD,"calculated. same");
row("Tradeify FX","Daily 1-Step","50K",125,249,"MILK -50%",1,TFD,"calculated. same");
row("Tradeify FX","Direct (instant)","5K",43,85,"MILK -50%",0,TFI,"calculated. 6% trailing DD + lock, 20% consistency");
row("Tradeify FX","Direct (instant)","10K",60,119,"MILK -50%",0,TFI,"calculated. same");
row("Tradeify FX","Direct (instant)","25K",105,209,"MILK -50%",0,TFI,"calculated. same");
const T2: Crit[] = [1,1,1,1,.5,0,1,1];
row("Tradeify247 (crypto)","1-Step","10K",60,100,"OCT -40% (expired)",1,T2,"seen 12 Oct. 12% target, 3% daily, 6% static DD, funding 0.033%/day");
row("Tradeify247 (crypto)","1-Step","25K",139,231,"OCT -40% (expired)",1,T2,"same");
row("Tradeify247 (crypto)","2-Step","10K",60,100,"OCT -40% (expired)",2,T2,"10%/5%, 6% static DD, funded: 3 profitable days");
row("Tradeify247 (crypto)","2-Step","25K",120,200,"OCT -40% (expired)",2,T2,"same");
row("Tradeify247 (crypto)","Instant","10K",120,200,"OCT -40% (expired)",0,[1,1,.5,0,.5,0,1,1],"6% trailing DD + lock, 20% consistency, leverage 2:1");
const UZ1: Crit[] = [1,1,.5,0,.5,null,1,1], UZ2: Crit[] = [1,1,.5,1,.5,null,1,1], UZF: Crit[] = [1,1,1,0,.5,null,1,1], UZI: Crit[] = [1,1,.5,0,.5,null,1,1];
row("UZO","One Step","5K",29.85,149.27,"AUTUMN80",1,UZ1,"EUR 27.14 at checkout. 6%, 6% trailing DD, 3% daily, best day 20% (blocks reward), first payout max $150");
row("UZO","One Step","10K",41.8,209.0,"AUTUMN80",1,UZ1,"EUR 38. same; rewards max $150, $225, $300, then $400");
row("UZO","One Step","25K",74.58,372.9,"AUTUMN80",1,UZ1,"EUR 67.80. first reward max $375");
row("UZO","One Step","50K",107.8,539.0,"AUTUMN80",1,UZ1,"EUR 98. first reward max $750");
row("UZO","One Step Flex","5K",48.18,240.9,"AUTUMN80",1,UZF,"EUR 43.80. 9%, 6% trailing DD, no consistency, 3 minimum days, payout every 2 weeks");
row("UZO","One Step Flex","10K",74.58,372.9,"AUTUMN80",1,UZF,"EUR 67.80. same");
row("UZO","One Step Flex","25K",138.38,691.9,"AUTUMN80",1,UZF,"EUR 125.80. same");
row("UZO","Two Step","5K",26.55,132.77,"AUTUMN80",2,UZ2,"EUR 24.14. 6%+4%, 8% static DD, 4% daily, no minimum days, first payout max $150");
row("UZO","Two Step","10K",37.18,185.9,"AUTUMN80",2,UZ2,"EUR 33.80. same; rewards max $175, $250, $325");
row("UZO","Two Step","25K",63.8,319.0,"AUTUMN80",2,UZ2,"EUR 58");
row("UZO","Two Step","50K",96.58,482.9,"AUTUMN80",2,UZ2,"EUR 87.80");
row("UZO","Instant","5K",40.7,203.5,"AUTUMN80",0,UZI,"EUR 37. 5% trailing DD, 3% daily, 5 minimum days, first payout max $125");
row("UZO","Instant","10K",56.98,284.9,"AUTUMN80",0,UZI,"EUR 51.80. same");
row("UZO","Instant Pro","5K",54.78,273.9,"AUTUMN80",0,UZI,"EUR 49.80. 6% trailing DD, 4% daily, 6 minimum days");
row("UZO","Instant Pro","10K",92.72,463.6,"AUTUMN80",0,UZI,"EUR 84.29. same");
const IC: Crit[] = [1,0,.5,1,0,0,.5,.5], ICI: Crit[] = [1,0,0,0,0,0,.5,0], IC2: Crit[] = [1,0,1,1,0,0,.5,.5];
row("IC Funded","2-Step Professional","5K",40.7,74,"BLACKIC45",2,IC2,"-45%, third-party price. 10% static DD, 5% daily on EOD equity, no weekend holding, own EAs only");
row("IC Funded","2-Step Professional","10K",68.75,125,"BLACKIC45",2,IC2,"-45%, third-party price (not tested). same");
row("IC Funded","2-Step Professional","25K",136.95,249,"BLACKIC45",2,IC2,"-45%, third-party price. same");
row("IC Funded","1-Step Accelerated","10K",84.7,154,"BLACKIC45",1,IC,"VERIFIED at checkout. 6% static DD, 3% daily, leverage 1:30, 45% consistency in evaluation only, no weekend holding");
row("IC Funded","1-Step Accelerated","25K",169.95,309,"BLACKIC45",1,IC,"VERIFIED at checkout. same");
row("IC Funded","Instant Funded","5K",59.95,109,"BLACKIC45",0,ICI,"VERIFIED at checkout. 5% trailing EOD DD ($250), 3% daily, 20% consistency, news forbidden, no weekend holding");
row("IC Funded","Instant Funded","10K",90.2,164,"BLACKIC45",0,ICI,"VERIFIED at checkout. 5% trailing EOD DD ($500), 3% daily ($300), 20% consistency, 1.5% risk per idea, sessions 5 days of $50");
row("IC Funded","Instant Funded","25K",186.45,339,"BLACKIC45",0,ICI,"VERIFIED at checkout. same, DD $1,250");
// Fintokei: own EAs ok (also customised third-party ones), copy between own accounts ok, static DD, news and weekend free.
// "No consistency" is 0.5 because Fintokei can impose Consistency Rules (CR1/CR2) after warnings. Swap-free not found: null.
const FK: Crit[] = [1,1,.5,1,.5,null,1,1];
const FKS: Crit[] = [1,1,.5,1,.5,null,1,1];
row("Fintokei","SwiftTrader 1-Step","5K",35.2,44,"BLACKFRIDAY20",1,FKS,"VERIFIED at checkout ($44 -> $35.20). 6% target, 2% daily on equity, 3% static max loss ($150), 3% daily profit cap in evaluation, max 60 days, 90% split, instant payouts, own EAs ok");
row("Fintokei","SwiftTrader 1-Step","10K",71.2,89,"BLACKFRIDAY20",1,FKS,"VERIFIED at checkout ($89 -> $71.20). 6% target, 2% daily ($200), 3% static max loss ($300), 3 days minimum, 90% split, leverage 1:25");
row("Fintokei","SwiftTrader 1-Step","20K",115.2,144,"BLACKFRIDAY20",1,FKS,"VERIFIED at checkout ($144 -> $115.20). Same rules");
row("Fintokei","SwiftTrader 1-Step","50K",239.2,299,"BLACKFRIDAY20",1,FKS,"VERIFIED at checkout, above $200 only as reference (not shown in this table)");
row("Fintokei","ProTrader 2-Step","5K",39.2,49,"BLACKFRIDAY20",2,FK,"VERIFIED at checkout ($49 -> $39.20). 8% + 6%, 5% daily, 10% static max loss, 3 trading days, 80% split, 1:100 on FX and gold");
row("Fintokei","ProTrader 2-Step","10K",79.2,99,"BLACKFRIDAY20",2,FK,"VERIFIED at checkout ($99 -> $79.20). Same rules, $1,000 static buffer");
row("Fintokei","ProTrader 2-Step","20K",127.2,159,"BLACKFRIDAY20",2,FK,"VERIFIED at checkout ($159 -> $127.20). Same rules");
row("Fintokei","ProTrader Swing 2-Step","5K",55.2,69,"BLACKFRIDAY20",2,FK,"VERIFIED at checkout ($69 -> $55.20). Same targets and drawdown as ProTrader, for swing trading");
row("Fintokei","ProTrader Swing 2-Step","10K",95.2,119,"BLACKFRIDAY20",2,FK,"calculated ($119 -20%, list read at checkout). Same rules");
row("Fintokei","ProTrader Swing 2-Step","20K",159.2,199,"BLACKFRIDAY20",2,FK,"calculated ($199 -20%, list read at checkout). Same rules");
row("Fintokei","StartTrader 1-Phase","5K",27.2,34,"BLACKFRIDAY20",1,[1,1,.5,1,.5,null,1,1],"VERIFIED at checkout ($34 -> $27.20). 3% target, 80% flat split since 21 Oct 2026, soft breach gives a second chance");

const FP0: Crit[] = [1,1,.5,0,0,0,0,0], FP1: Crit[] = [1,1,.5,1,0,.5,.5,.5];
row("FundingPips","Zero (instant)","5K",51.0,60,"HALLOWEEN -15%",0,FP0,"5% trailing DD, 1% open risk, 7 profitable days/30, no news/weekend");
row("FundingPips","Zero (instant)","10K",74.8,88,"HALLOWEEN -15%",0,FP0,"same");
row("FundingPips","Zero (instant)","25K",159.8,188,"HALLOWEEN -15%",0,FP0,"same");
row("FundingPips","1-Step Flex","5K",62.9,74,"HALLOWEEN -15%",1,FP1,"calculated: list $74 -15% (existing customer). 12%/12% static, 2-3% daily, VPS forbidden, Swing and swap-free paid");
row("FundingPips","1-Step Flex","10K",94.35,111,"HALLOWEEN -15%",1,FP1,"VERIFIED in a logged-in cart (existing customer; new -20% = $88.80). 12% static, 2-3% daily, VPS forbidden, no minimum days");
row("FundingPips","2-Step Pro","5K",33,33,"-",2,FP1,"list of 29 Sep, probably lower now. 6%/6%, 6% DD, 3% daily");
row("FundingPips","2-Step Pro","10K",62,62,"-",2,FP1,"same");
row("FundingPips","2-Step Pro","25K",149,149,"-",2,FP1,"same");
row("FundingPips","2-Step Flex","10K",70,70,"-",2,FP1,"10%/8%, 12% DD, 4% daily");
row("FundingPips","2-Step Flex","25K",188,188,"-",2,FP1,"same");
row("FundingPips","2-Step Standard","10K",80,80,"-",2,FP1,"8%/5%, 10% DD, 3 days");

export const rowData = R;
