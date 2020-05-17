// React Imports
import React, { useState } from 'react'
// Material UI Imports
import { 
	ThemeProvider, TextField, Button, Container, CircularProgress, Typography, Grid,
	TableContainer, Table, TableHead, TableBody, TableRow, TableCell,
} from '@material-ui/core'
import { createMuiTheme } from '@material-ui/core/styles'
import { teal } from '@material-ui/core/colors'
// API Imports
import axios from 'axios'
// import exampleData from './exampleDataAAPL'
// import exampleData from './exampleDataDIS'

const theme = createMuiTheme({	
	palette: {
	  	primary: {
			main: teal[400],
			dark: teal[600]
		}
	}
})

const App = () => {
	const [financialsData, setFinancialsData] = useState(null)
	const [analysisData, setAnalysisData] = useState(null)
	const [query, setQuery] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [isError, setIsError] = useState(false)

	const fetchData = async () => {
		setIsError(false)
		setIsLoading(true)

		try {
			const result = await axios({
				"method":"GET",
				"url": "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-financials",
				"headers": {
					"content-type":"application/octet-stream",
					"x-rapidapi-host":"apidojo-yahoo-finance-v1.p.rapidapi.com",
					"x-rapidapi-key":"805f819a5emsh95d2744e0ddef68p1d8500jsn95d02e0277d1"
				},
				"params": {
					"symbol": query
				}
			})
			console.log("result.data", result.data)
			setFinancialsData(result.data)
		} catch (error) {
			setIsError(true)
		}

		try {
			const result = await axios({
				"method":"GET",
				"url": "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-analysis",
				"headers": {
					"content-type":"application/octet-stream",
					"x-rapidapi-host":"apidojo-yahoo-finance-v1.p.rapidapi.com",
					"x-rapidapi-key":"805f819a5emsh95d2744e0ddef68p1d8500jsn95d02e0277d1"
				},
				"params": {
					"symbol": query
				}
			})
			console.log("result.data", result.data)
			setAnalysisData(result.data)
		} catch (error) {
			setIsError(true)
		}

		// console.log("financialsData", exampleData.financialsData)
		// setFinancialsData(exampleData.financialsData)
		// console.log("analysisData", exampleData.analysisData)
		// setAnalysisData(exampleData.analysisData)
		
		setIsLoading(false)
	}

	let outstandingShares = 0, intrinsicValue = 0, currencySymbol = ""
	if (financialsData !== null && analysisData !== null) {
		currencySymbol = financialsData.price.currencySymbol
		outstandingShares = analysisData.price.marketCap.raw / analysisData.price.regularMarketPrice.raw
		intrinsicValue = calculateIntrinsicValue(financialsData, analysisData, outstandingShares)
	}

	return (
		<ThemeProvider theme={theme}>
			<Container>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Typography variant="h4">Stock Analysis</Typography>
					</Grid>
					<Grid item xs={12}>
						<TextField variant="outlined" fullWidth label="Enter stock symbol (e.g. AAPL, V, BABA)" value={query} onChange={event => setQuery(event.target.value)} />
					</Grid>
					<Grid item xs={12}>
						<Button color="primary" variant="contained" onClick={fetchData}>
							Analyze
						</Button>
					</Grid>
					<Grid item xs={12}>
						{
							isLoading ? <CircularProgress /> :
							isError ? <div>Something went wrong ...</div> :
							financialsData !== null && analysisData !== null && (
								<TableContainer>
									<Table>
										<TableHead>
											<TableRow>
												<TableCell colSpan={7}>
													<Typography variant="h5">{financialsData.quoteType.longName}</Typography>
													<Typography variant="body2">{financialsData.price.exchangeName}</Typography>
												</TableCell>
											</TableRow>
										</TableHead>
										
										<TableHead>
											<TableRow>
												<TableCell colSpan={7}>
													<Typography variant="h6">Valuation</Typography>
												</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											<TableRow>
												<TableCell>Current Price</TableCell>
												<TableCell colSpan={6}>{currencySymbol + financialsData.price.regularMarketPrice.fmt}</TableCell>
											</TableRow>
											<TableRow>
												<TableCell>Intrinsic Value</TableCell>
												<TableCell colSpan={6}>{intrinsicValue !== 0 ? (currencySymbol + intrinsicValue) : "Calculation Error"}</TableCell>
											</TableRow>
											<TableRow>
												<TableCell>PE Ratio &#40;TTM&#41;</TableCell>
												<TableCell colSpan={6}>{financialsData.summaryDetail.trailingPE ? financialsData.summaryDetail.trailingPE.fmt : ''}</TableCell>
											</TableRow>
											<TableRow>
												<TableCell>Forward P/E</TableCell>
												<TableCell colSpan={6}>{financialsData.summaryDetail.forwardPE ? financialsData.summaryDetail.forwardPE.fmt : ''}</TableCell>
											</TableRow>
										</TableBody>

										<TableHead>
											<TableRow>
												<TableCell colSpan={7}>
													<Typography variant="h6">Financials</Typography>
												</TableCell>
											</TableRow>
										</TableHead>
										{renderFinancials(financialsData, "yearly")}
										{renderFinancials(financialsData, "quarterly")}

										<TableHead>
											<TableRow>
												<TableCell colSpan={7}>
													<Typography variant="h6">Profitability</Typography>
												</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											<TableRow>
												<TableCell>Gross Margin &#40;TTM&#41;</TableCell>
												<TableCell colSpan={6}>{analysisData.financialData.grossMargins.fmt}</TableCell>
											</TableRow>
											<TableRow>
												<TableCell>Profit Margin &#40;TTM&#41;</TableCell>
												<TableCell colSpan={6}>{analysisData.financialData.profitMargins.fmt}</TableCell>
											</TableRow>
											<TableRow>
												<TableCell>
													Return on Equity &#40;TTM&#41;<br/>
													<small><strong>Good to be more than 12%</strong></small>
												</TableCell>
												<TableCell colSpan={6}>{analysisData.financialData.returnOnEquity.fmt}</TableCell>
											</TableRow>
										</TableBody>

										<TableHead>
											<TableRow>
												<TableCell colSpan={7}>
													<Typography variant="h6">Growth Estimates</Typography>
												</TableCell>
											</TableRow>
											<TableRow>
												<TableCell>Period</TableCell>
												<TableCell>Current Qtr</TableCell>
												<TableCell>Next Qtr</TableCell>
												<TableCell>Current Year</TableCell>
												<TableCell>Next Year</TableCell>
												<TableCell>Next 5 Years &#40;per annum&#41;</TableCell>
												<TableCell>Past 5 Years &#40;per annum&#41;</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											<TableRow>
												<TableCell>Estimate</TableCell>
												<TableCell>{analysisData.earningsTrend.trend.find(t => t.period === "0q") && analysisData.earningsTrend.trend.find(t => t.period === "0q").growth.fmt}</TableCell>
												<TableCell>{analysisData.earningsTrend.trend.find(t => t.period === "+1q") && analysisData.earningsTrend.trend.find(t => t.period === "+1q").growth.fmt}</TableCell>
												<TableCell>{analysisData.earningsTrend.trend.find(t => t.period === "0y") && analysisData.earningsTrend.trend.find(t => t.period === "0y").growth.fmt}</TableCell>
												<TableCell>{analysisData.earningsTrend.trend.find(t => t.period === "+1y") && analysisData.earningsTrend.trend.find(t => t.period === "+1y").growth.fmt}</TableCell>
												<TableCell>{analysisData.earningsTrend.trend.find(t => t.period === "+5y") && analysisData.earningsTrend.trend.find(t => t.period === "+5y").growth.fmt}</TableCell>
												<TableCell>{analysisData.earningsTrend.trend.find(t => t.period === "-5y") && analysisData.earningsTrend.trend.find(t => t.period === "-5y").growth.fmt}</TableCell>
											</TableRow>
										</TableBody>

										<TableHead>
											<TableRow>
												<TableCell colSpan={7}>
													<Typography variant="h6">EPS History</Typography>
												</TableCell>
											</TableRow>
											<TableRow>
												<TableCell>
													Quarter
												</TableCell>
												<TableCell colSpan={3}>
													Actual
												</TableCell>
												<TableCell colSpan={3}>
													Estimate
												</TableCell>
											</TableRow>
										</TableHead>
										{renderEPSHistory(financialsData)}

										<TableHead>
											<TableRow>
												<TableCell colSpan={7}>
													<Typography variant="h6">Debt Management</Typography>
												</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											<TableRow>
												<TableCell>
													Free Cashflow Per Share
												</TableCell>
												<TableCell colSpan={6}>{currencySymbol + ((financialsData.cashflowStatementHistory.cashflowStatements[0].totalCashFromOperatingActivities.raw - financialsData.cashflowStatementHistory.cashflowStatements[0].capitalExpenditures.raw) / outstandingShares).toFixed(2)}</TableCell>
											</TableRow>
											<TableRow>
												<TableCell>
													Debt to Equity Ratio &#40;mrq&#41;<br/>
													<small><strong>Good to be less than 1</strong></small>
												</TableCell>
												<TableCell colSpan={6}>{(analysisData.financialData.debtToEquity.raw / 100).toFixed(2)}</TableCell>
											</TableRow>
											<TableRow>
												<TableCell>
													Current Ratio &#40;mrq&#41; - Current Assets / Current Liabilities<br/>
													<small><strong>Good to be more than 1</strong></small>
												</TableCell>
												<TableCell colSpan={6}>{analysisData.financialData.currentRatio.fmt}</TableCell>
											</TableRow>
										</TableBody>

										<TableHead>
											<TableRow>
												<TableCell colSpan={7}>
													<Typography variant="h6">Dividend</Typography>
												</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											<TableRow>
												<TableCell>Annual Dividend Yield</TableCell>
												<TableCell colSpan={6}>{financialsData.summaryDetail.dividendYield && financialsData.summaryDetail.dividendYield.fmt ? financialsData.summaryDetail.dividendYield.fmt : 'N/A'}</TableCell>
											</TableRow>
											<TableRow>
												<TableCell>
													Dividend Payout Ratio<br/>
													&#40;Good to be less than 50%&#41;
												</TableCell>
												<TableCell colSpan={6}>{financialsData.summaryDetail.payoutRatio && financialsData.summaryDetail.payoutRatio.fmt ? financialsData.summaryDetail.payoutRatio.fmt : 'N/A'}</TableCell>
											</TableRow>
										</TableBody>
									</Table>
								</TableContainer>
							)
						}
					</Grid>
				</Grid>
			</Container>
		</ThemeProvider>
	)
}

const calculateOperatingCashflowTTM = (financialsData) => {
	let operatingCashflowSum = 0

	financialsData.cashflowStatementHistoryQuarterly.cashflowStatements.forEach(s => {
		operatingCashflowSum += s.totalCashFromOperatingActivities.raw
	})

	return operatingCashflowSum
}

const calculateCapitalExpenditureTTM = (financialsData) => {
	let capitalExpenditureSum = 0

	financialsData.cashflowStatementHistoryQuarterly.cashflowStatements.forEach(s => {
		capitalExpenditureSum += s.capitalExpenditures.raw
	})

	return capitalExpenditureSum
}

const calculateIntrinsicValue = (financialsData, analysisData, outstandingShares) => {
	const stGrowthRate = analysisData.earningsTrend.trend.find(t => t.period === "+5y") && analysisData.earningsTrend.trend.find(t => t.period === "+5y").growth.raw
	const ltGrowthRate = ((stGrowthRate / 2) <= 0.15) ? (stGrowthRate / 2) : 0.15
	const beta = analysisData.summaryDetail.beta.raw
	let discountRate = 0

	if (beta <= 0.8) {
		discountRate = 0.05
	} else if (beta <= 0.9) {
		discountRate = 0.055
	} else if (beta <= 1) {
		discountRate = 0.06
	} else if (beta <= 1.1) {
		discountRate = 0.065
	} else if (beta <= 1.2) {
		discountRate = 0.07
	} else if (beta <= 1.3) {
		discountRate = 0.075
	} else if (beta <= 1.4) {
		discountRate = 0.08
	} else if (beta <= 1.5) {
		discountRate = 0.085
	} else if (beta <= 1.6) {
		discountRate = 0.09
	} else {
		console.log("discountRate error. beta =", beta)
	}

	let projectedCashflow = [], discountFactor = [], discountedCashflow = [], totalDiscountedCashflow = 0

	let freeCashflow = calculateOperatingCashflowTTM(financialsData) + calculateCapitalExpenditureTTM(financialsData)
	// note: capitalExpenditures is a negative number, that's why it is plus, not minus, in the above line

	for (let year = 0; year < 11; year++) {
		if (year === 0) {
			projectedCashflow.push(freeCashflow * (1 + stGrowthRate))
			discountFactor.push(1 / (1 + discountRate))
		}

		else {
			discountFactor.push(discountFactor[year - 1] / (1 + discountRate))

			if (year <= 3) {
				projectedCashflow.push(projectedCashflow[year - 1] * (1 + stGrowthRate))
			}
			else {
				projectedCashflow.push(projectedCashflow[year - 1] * (1 + ltGrowthRate))
			}

			const cashflowForYear = projectedCashflow[year] * discountFactor[year]
			discountedCashflow.push(cashflowForYear)
			totalDiscountedCashflow += cashflowForYear
		}
	}

	console.log('operating cashflow', calculateOperatingCashflowTTM(financialsData))
	console.log('capital expenditures', calculateCapitalExpenditureTTM(financialsData))
	console.log('freeCashflow', freeCashflow)
	console.log('discountedCashflow', discountedCashflow)

	console.log('totalDiscountedCashflow', totalDiscountedCashflow)
	console.log('total cash', analysisData.financialData.totalCash.raw)
	console.log('total debt', analysisData.financialData.totalDebt.raw)
	console.log('outstanding shares', outstandingShares)

	return ((totalDiscountedCashflow + (discountedCashflow[9] * 12) + analysisData.financialData.totalCash.raw - analysisData.financialData.totalDebt.raw) / outstandingShares).toFixed(2)
}

const renderFinancials = (financialsData, type) => {
	/* Start Financials */
	let mappedDate = []
	let dataFinancialsChart = financialsData.earnings.financialsChart[`${type}`]
	let mappedRevenue = [], meanRevenueIncrease = 0, positiveRevenueIncreaseCount = 0
	let mappedEarnings = [], meanEarningsIncrease = 0, positiveEarningsIncreaseCount = 0

	dataFinancialsChart.forEach((d, idx) => {
		// for display
		mappedDate.push(<TableCell key={idx}>{d.date}</TableCell>)
		mappedRevenue.push(<TableCell key={idx}>{d.revenue.fmt}</TableCell>)
		mappedEarnings.push(<TableCell key={idx}>{d.earnings.fmt}</TableCell>)

		// for calculation
		if (idx > 0) {
			meanRevenueIncrease += ((d.revenue.raw - dataFinancialsChart[idx -1].revenue.raw) / Math.abs(dataFinancialsChart[idx - 1].revenue.raw))
			meanEarningsIncrease += ((d.earnings.raw - dataFinancialsChart[idx -1].earnings.raw) / Math.abs(dataFinancialsChart[idx - 1].earnings.raw))

			if (d.revenue.raw > dataFinancialsChart[idx -1].revenue.raw) {
				positiveRevenueIncreaseCount += 1
			}
			if (d.earnings.raw > dataFinancialsChart[idx -1].earnings.raw) {
				positiveEarningsIncreaseCount += 1
			}
		}
	})

	meanRevenueIncrease /= (dataFinancialsChart.length - 1)
	meanEarningsIncrease /= (dataFinancialsChart.length - 1)

	// reverse cos the financialsData is somehow old to new. I want new to old (new at leftmost side)
	mappedDate.reverse()
	mappedRevenue.reverse()
	mappedEarnings.reverse()
	/* End Financials */

	/* Start Cashflow */
	let dataCashflowStatements = []
	if (type === "yearly") {
		dataCashflowStatements = financialsData.cashflowStatementHistory.cashflowStatements
	} else if (type === "quarterly") {
		dataCashflowStatements = financialsData.cashflowStatementHistoryQuarterly.cashflowStatements
	}
	let mappedCashflow = [], meanCashflowIncrease = 0, positiveCashflowIncreaseCount = 0

	dataCashflowStatements.forEach((d, idx) => {
		// for display
		mappedCashflow.push(<TableCell key={idx}>{d.totalCashFromOperatingActivities.fmt}</TableCell>)

		// for calculation
		if (idx < dataCashflowStatements.length - 1) {
			meanCashflowIncrease += ((d.totalCashFromOperatingActivities.raw - dataCashflowStatements[idx + 1].totalCashFromOperatingActivities.raw) / Math.abs(dataCashflowStatements[idx + 1].totalCashFromOperatingActivities.raw))

			if (d.totalCashFromOperatingActivities.raw > dataCashflowStatements[idx + 1].totalCashFromOperatingActivities.raw) {
				positiveCashflowIncreaseCount += 1
			}
		}
	})

	meanCashflowIncrease /= (dataCashflowStatements.length - 1)
	/* End Cashflow */	

	/* Display & Calculation Start */

	// add labels
	mappedDate.unshift(<TableCell key="label">{type.charAt(0).toUpperCase() + type.substring(1)} Financials</TableCell>)
	mappedRevenue.unshift(<TableCell key="label">Total Revenue</TableCell>)
	mappedEarnings.unshift(<TableCell key="label">Net Income</TableCell>)
	mappedCashflow.unshift(<TableCell key="label">Cash from Operating Activites</TableCell>)

	// add mean
	if (type === "yearly") {
		mappedDate.push(<TableCell key="mean">Mean Increase / Year</TableCell>)
	} else if (type === "quarterly") {
		mappedDate.push(<TableCell key="mean">Mean Increase / Qtr</TableCell>)
	}
	mappedDate.push(<TableCell key="positiveIncreaseCount">Positive Increase In</TableCell>)
	mappedRevenue.push(
		<TableCell key="mean">{(meanRevenueIncrease * 100).toFixed(2)}%</TableCell>,
	<TableCell key="positiveIncreaseCount">{positiveRevenueIncreaseCount} / {dataFinancialsChart.length - 1} {type === 'yearly' ? 'years' : 'quarters'}</TableCell>
	)
	mappedEarnings.push(
		<TableCell key="mean">{(meanEarningsIncrease * 100).toFixed(2)}%</TableCell>,
		<TableCell key="positiveIncreaseCount">{positiveEarningsIncreaseCount} / {dataFinancialsChart.length - 1} {type === 'yearly' ? 'years' : 'quarters'}</TableCell>
	)
	mappedCashflow.push(
		<TableCell key="mean">{(meanCashflowIncrease * 100).toFixed(2)}%</TableCell>,
		<TableCell key="positiveIncreaseCount">{positiveCashflowIncreaseCount} / {dataCashflowStatements.length - 1} {type === 'yearly' ? 'years' : 'quarters'}</TableCell>
	)
	/* Display & Calculation End */

	return (
		<>
			<TableHead>
				<TableRow>
					{mappedDate}
				</TableRow>
			</TableHead>
			<TableBody>
				<TableRow>
					{mappedRevenue}
				</TableRow>
				<TableRow>
					{mappedEarnings}
				</TableRow>
				<TableRow>
					{mappedCashflow}
				</TableRow>
			</TableBody>
		</>
	)
}

const renderEPSHistory = (data) => {
	let epsHistory = data.earnings.earningsChart.quarterly.map((d, idx) => {
		return (
			<TableRow key={idx}>
				<TableCell>
					{d.date}
				</TableCell>
				<TableCell colSpan={3}>
					{d.actual.fmt} &#40;{d.actual.raw >= d.estimate.raw ? "Beat" : d.actual.raw === d.estimate.raw ? "Met" : "Missed"}&#41;
				</TableCell>
				<TableCell colSpan={3}>
					{d.estimate.fmt}
				</TableCell>
			</TableRow>
		)
	})

	epsHistory.push(
		<TableRow key={epsHistory.length}>
			<TableCell>
				{data.earnings.earningsChart.currentQuarterEstimateDate}{data.earnings.earningsChart.currentQuarterEstimateYear}
			</TableCell>
			<TableCell colSpan={3}>
				-
			</TableCell>
			<TableCell colSpan={3}>
				{data.earnings.earningsChart.currentQuarterEstimate ? data.earnings.earningsChart.currentQuarterEstimate.fmt : '-'}
			</TableCell>
		</TableRow>
	)

	return (
		<TableBody>
			{epsHistory}
		</TableBody>
	)
}

export default App