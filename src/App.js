import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { TextField, Button, Container, CircularProgress, Typography, Grid } from '@material-ui/core'

function App() {
  const [data, setData] = useState(null)
  const [query, setQuery] = useState('')
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  useEffect(() => {
    const fetchData = async () => {
      setIsError(false)
      setIsLoading(true)
      try {
        const result = await axios(url)
        setData(result.data)
      } catch (error) {
        setIsError(true)
      }
      setIsLoading(false)
    }
    url !== '' && fetchData()
  }, [url])
  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4">US Stock Analysis</Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField variant="outlined" fullWidth label="Enter stock symbol (e.g. AAPL, V, BABA)" value={query} onChange={event => setQuery(event.target.value)} />
          {console.log(query)}
        </Grid>
        <Grid item xs={12}>
          <Button color="primary" variant="contained" onClick={() => setUrl(`https://5usj8lodn8.execute-api.ap-southeast-1.amazonaws.com/DEV?stock=${query}`)}>
            Analyze
          </Button>
        </Grid>
        <Grid item xs={12}>
          {isError && <div>Something went wrong ...</div>}
          {isLoading && <CircularProgress />}
          {data !== null && (
            <div>
              <Typography variant="h4">{data.company_name}</Typography>
              <Typography variant="h5">Valuation</Typography>
              <Typography variant="body1">Current Price: ${data.price}</Typography>
              <Typography variant="body1">Intrinsic Value: ${data.intrinsic_value}</Typography>
              <Typography variant="body1">PE Ratio: ${data.pe}</Typography>
              <Typography variant="body1">Forward PE: ${data.forward_pe}</Typography>
              <Typography variant="h5">Annual Financials</Typography>
              <Typography variant="body1">Mean Revenue Increase Per Year: {data.mean_revenue_increase_per_year} / 4 years)</Typography>
              <Typography variant="body1">Mean Net Income Increase Per Year: {data.mean_net_income_increase_per_year} / 4 years)</Typography>
              <Typography variant="body1">Mean Cashflow Increase Per Year: {data.mean_cashflow_increase_per_year} / 4 years)</Typography>
              <Typography variant="body1">EPS Next 5Y: {data.eps_5y}</Typography>
              <Typography variant="body1">Number of Years of Positive Revenue Growth: {data.number_of_years_of_consistent_revenue_growth}</Typography>
              <Typography variant="body1">Number of Years of Positive Net Income Growth: {data.number_of_years_of_consistent_net_income_growth}</Typography>
              <Typography variant="body1">Number of Years of Positive Cashflow Growth: {data.number_of_years_of_consistent_cashflow_growth}</Typography>
              <Typography variant="h5">Quarterly Financials</Typography>
              <Typography variant="body1">Mean Revenue Increase Per Quarter: {data.mean_revenue_increase_per_quarter} / 4 quarters)</Typography>
              <Typography variant="body1">Mean Net Income Increase Per Quarter: {data.mean_net_income_increase_per_quarter} / 4 quarters)</Typography>
              <Typography variant="body1">Mean Cashflow Increase Per Quarter: {data.mean_cashflow_increase_per_quarter} / 4 quarters)</Typography>
              <Typography variant="body1">EPS Q/Q: {data.eps_qq}</Typography>
              <Typography variant="body1">Number of Quarters of Positive Revenue Growth: {data.number_of_quarters_of_consistent_revenue_growth}</Typography>
              <Typography variant="body1">Number of Quarters of Positive Net Income Growth: {data.number_of_quarters_of_consistent_net_income_growth}</Typography>
              <Typography variant="body1">Number of Quarters of Positive Cashflow Growth: {data.number_of_quarters_of_consistent_cashflow_growth}</Typography>
              <Typography variant="h5">Profitability</Typography>
              <Typography variant="body1">Gross Margin: {data.gross_margin}</Typography>
              <Typography variant="body1">Profit Margin: {data.profit_margin}</Typography>
              <Typography variant="body1">Return on Equity (good to be more than 12%): {data.roe}</Typography>
              <Typography variant="h5">Debt Management</Typography>
              <Typography variant="body1">Debt to Equity Ratio (good to be less than 1): {data.debt_equity_ratio}</Typography>
              <Typography variant="body1">Current Assets / Current Liabilities (Current Ratio - good to be more than 1): {data.current_ratio}</Typography>
              <Typography variant="h5">Dividend</Typography>
              <Typography variant="body1">Annual Dividend Yield: {data.annual_dividend_yield}</Typography>
              <Typography variant="body1">Dividend Payout Ratio (good to be less than 50%): {data.dividend_payout_ratio}</Typography>
            </div>
          )}
        </Grid>
      </Grid>
    </Container>
  )
}
export default App
