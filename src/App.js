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
import exampleData from './exampleData'

const theme = createMuiTheme({	
	palette: {
	  	primary: {
			main: teal[400],
			dark: teal[600]
		}
	}
})

function App() {
	const [financialsData, setFinancialsData] = useState(null)
	const [statisticsData, setStatisticsData] = useState(null)
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
				"url": "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-statistics",
				"headers": {
					"content-type":"application/octet-stream",
					"x-rapidapi-host":"apidojo-yahoo-finance-v1.p.rapidapi.com",
					"x-rapidapi-key":"805f819a5emsh95d2744e0ddef68p1d8500jsn95d02e0277d1"
				},
				"params": {
					"region": "US", //to select which Yahoo Finance website to access (does not restrict only to US markets)
					"symbol": query
				}
			})
			console.log("result.data", result.data)
			setStatisticsData(result.data)
		} catch (error) {
			setIsError(true)
		}

		// console.log("financialsData", exampleData.financialsData)
		// setFinancialsData(exampleData.financialsData)
		// console.log("statisticsData", exampleData.statisticsData)
		// setStatisticsData(exampleData.statisticsData)
		
		setIsLoading(false)
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
						{isError && <div>Something went wrong ...</div>}
						{isLoading && <CircularProgress />}
						{financialsData !== null && statisticsData !== null && (
							<TableContainer>
								<Table>
									<TableHead>
										<TableCell colSpan={7}>
											<Typography variant="h5">{financialsData.quoteType.longName}</Typography>
											<Typography variant="body2">{financialsData.price.exchangeName}</Typography>
										</TableCell>
									</TableHead>
									
									<TableHead>
										<TableCell colSpan={7}>
											<Typography variant="h6">Valuation</Typography>
										</TableCell>
									</TableHead>
									<TableRow>
										<TableCell>Current Price</TableCell>
										<TableCell colSpan={6}>${financialsData.price.regularMarketPrice.fmt}</TableCell>
									</TableRow>
									<TableRow>
										<TableCell>Trailing P/E</TableCell>
										<TableCell colSpan={6}>{financialsData.summaryDetail.trailingPE.fmt}</TableCell>
									</TableRow>
									<TableRow>
										<TableCell>Forward P/E</TableCell>
										<TableCell colSpan={6}>{financialsData.summaryDetail.forwardPE.fmt}</TableCell>
									</TableRow>

									<TableHead>
										<TableCell colSpan={7}>
											<Typography variant="h6">Financials</Typography>
										</TableCell>
									</TableHead>
									{renderTableRows(financialsData, "yearly")}
									{renderTableRows(financialsData, "quarterly")}

									<TableHead>
										<TableCell colSpan={7}>
											<Typography variant="h6">Profitability</Typography>
										</TableCell>
									</TableHead>
									<TableRow>
										<TableCell>Gross Margin</TableCell>
										<TableCell colSpan={6}>{statisticsData.financialData.grossMargins.fmt}</TableCell>
									</TableRow>
									<TableRow>
										<TableCell>Profit Margin</TableCell>
										<TableCell colSpan={6}>{statisticsData.financialData.profitMargins.fmt}</TableCell>
									</TableRow>
									<TableRow>
										<TableCell>Return on Equity &#40;good to be more than 12%&#41;</TableCell>
										<TableCell colSpan={6}>{statisticsData.financialData.returnOnEquity.fmt}</TableCell>
									</TableRow>

									<TableHead>
										<TableCell colSpan={7}>
											<Typography variant="h6">Debt Management</Typography>
										</TableCell>
									</TableHead>
									<TableRow>
										<TableCell>Debt to Equity Ratio &#40;good to be less than 1&#41;</TableCell>
										<TableCell colSpan={6}>{(statisticsData.financialData.debtToEquity.raw / 100).toFixed(2)}</TableCell>
									</TableRow>
									<TableRow>
										<TableCell>Current Ratio &#40;Current Assets / Current Liabilities - good to be more than 1&#41;</TableCell>
										<TableCell colSpan={6}>{statisticsData.financialData.currentRatio.fmt}</TableCell>
									</TableRow>

									<TableHead>
										<TableCell colSpan={7}>
											<Typography variant="h6">Dividend</Typography>
										</TableCell>
									</TableHead>
									<TableRow>
										<TableCell>Annual Dividend Yield</TableCell>
										<TableCell colSpan={6}>{financialsData.summaryDetail.dividendYield.fmt}</TableCell>
									</TableRow>
									<TableRow>
										<TableCell>Dividend Payout Ratio &#40;good to be less than 50%&#41;</TableCell>
										<TableCell colSpan={6}>{financialsData.summaryDetail.payoutRatio.fmt}</TableCell>
									</TableRow>
								</Table>
							</TableContainer>
						)}
					</Grid>
				</Grid>
			</Container>
		</ThemeProvider>
	)
}

const renderTableRows = (data, type) => {
	/* Start Financials */
	let mappedDate = []
	let dataFinancialsChart = data.earnings.financialsChart[`${type}`]
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

	meanRevenueIncrease /= dataFinancialsChart.length
	meanEarningsIncrease /= dataFinancialsChart.length

	// reverse cos the data is somehow old to new. I want new to old (new at leftmost side)
	mappedDate.reverse()
	mappedRevenue.reverse()
	mappedEarnings.reverse()
	/* End Financials */

	/* Start Cashflow */
	let dataCashflowStatements = []
	if (type === "yearly") {
		dataCashflowStatements = data.cashflowStatementHistory.cashflowStatements
	} else if (type === "quarterly") {
		dataCashflowStatements = data.cashflowStatementHistoryQuarterly.cashflowStatements
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

	meanCashflowIncrease /= dataCashflowStatements.length
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
	mappedDate.push(<TableCell key="positiveIncreaseCount">Positive Increase Count</TableCell>)
	mappedRevenue.push(
		<TableCell key="mean">{(meanRevenueIncrease * 100).toFixed(2)}%</TableCell>,
		<TableCell key="positiveIncreaseCount">{positiveRevenueIncreaseCount} / {dataFinancialsChart.length - 1} years</TableCell>
	)
	mappedEarnings.push(
		<TableCell key="mean">{(meanEarningsIncrease * 100).toFixed(2)}%</TableCell>,
		<TableCell key="positiveIncreaseCount">{positiveEarningsIncreaseCount} / {dataFinancialsChart.length - 1} years</TableCell>
	)
	mappedCashflow.push(
		<TableCell key="mean">{(meanCashflowIncrease * 100).toFixed(2)}%</TableCell>,
		<TableCell key="positiveIncreaseCount">{positiveCashflowIncreaseCount} / {dataCashflowStatements.length - 1} years</TableCell>
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

export default App