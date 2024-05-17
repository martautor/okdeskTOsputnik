// import { useHttp } from "./hooks/http.hook";
import TextField from '@mui/material/TextField';
import React from 'react'
import {useState, useEffect} from 'react'
import Fetching from './fetching';
import { Box, Button, Grid } from '@mui/material';
// import hslog from './files/history.log.txt'

function App() {
  const [firstValue, setFirstValue] = useState('')
  const [secondValue, setSecondValue] = useState('')
  const [Error, newError] = useState({msg:'', clr: 'red'})
  const [History, newHistory] = useState('')
  const [Log, newLog] = useState({msg:'', clr: ''})

  useEffect(() => {
    async function getStatus() {
      return await fetch(`http://192.168.0.9:5000/api/test/`)
      .then(data => data.json())
      .then(data => newLog({msg: data.message, clr: data.color}))
      .catch(e => {
        newLog({msg: '[Ошибка] Нет связи с сервером', clr: 'red'})
        console.log(e)
      })
    }
    getStatus()
  }, [])

  const handleChangeFirstValue = (e) => {
    setFirstValue(e.target.value)
  }
  const handleChangeSecondValue = (e) => {
    setSecondValue(e.target.value)
  }
  const handleStart = async (e) => {
    // e.preventDefault()
    newLog({msg: 'Loading...', clr: 'gray'})
    // if(typeof secondValue !== 'number' || typeof secondValue !== 'number') {
    //   newError({msg:`[APP ERROR]  Поля должны быть заполнены цифрами.`, clr: 'red'})
    //   return false
    // }
    if(!secondValue || !firstValue) {
      newError({msg:`[APP ERROR]  Поля должны быть заполнены`, clr: 'red'})
      return false
    }
    try {
      newError({msg:``})
      newLog({msg: 'Loading...', clr: 'gray'})
      await Fetching(parseInt(firstValue), parseInt(secondValue))
      .then(res => res.json())
      .then(res => newLog({msg: res.message, clr: res.color}))
      .catch(e => newError({msg: `[SERVER ERROR] ${e.message === 'Failed to fetch' ? 'Нет ответа от сервера' : e.message}`, clr: 'red'}))
    } catch (error) {
      return newError(`\n[APP ERROR]  ${error.message}: ${error}:`)
    }
    const date = new Date().toLocaleDateString()
    const time = new Date().toLocaleTimeString('it-IT')
    // const fDate = `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`
    const text = <> {History} <p style={{textAlign: 'center', marginLeft: 25, color: 'grey'}}>{'['}{date} {time}{']'} {firstValue}-{secondValue} ID's</p></>
    // fs.writeFile('./files/history.log.txt', text)  
    localStorage.setItem("history", String(text))
    // saveAs(new File([String(text)], './files/history.log.txt', {type: 'text/plain;charset=utf-8'}))
    
    newHistory(text)
  }

  return (<Box sx={{ flexGrow: 1 }}>
    <Grid container spacing={0}  style={{marginTop: 75}}>
      <Grid item xs style={{textAlign: 'center'}}>
      <h3 >История обмена:</h3>
      {!History ? 'Нажмите "Загрузить заявки"': History}
      </Grid>
      <Grid item xs={4} style={{ height: 600, borderRight: 'solid', borderLeft: 'solid', borderColor: 'black'}}>
      <h2 style={{textAlign: 'center', marginBottom: 0}}>Обмен данными OkDesk to Sputnik</h2>
      <h5 style={{textAlign: 'center', margin: 0, opacity: 0.4}}> v 3.0.0 (stable)</h5>
      <h4 style={{textAlign: 'center', marginTop: 10, opacity: 0.9}}>by Martun Mkrtchyan {'<mart@kassa26.ru>'}</h4>
      <div style={{marginRight: '15px', display: 'flex', flexFlow: 'column', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}} className="App">
        <TextField
          hiddenLabel
          id="filled-hidden-label-small"
          defaultValue={firstValue}
          onChange={handleChangeFirstValue}
          variant="filled"
          size="small"
          type='number'
          pattern="\d+"
          placeholder='First ID'
          margin="normal"
          color='success'
        />
        <TextField
          hiddenLabel
          id="filled-hidden-label-small"
          defaultValue={secondValue}
          onChange={handleChangeSecondValue}
          variant="filled"
          size="small"
          type='number'
          pattern="\d+"
          placeholder='Last ID'
          margin="normal"
          color='success'
        />
        <br/>
        <Button size='small' variant="contained" onClick={handleStart} color='success' sx={{opacity: 0.9}}>Загрузить заявки</Button>
      </div>
        </Grid>
      <Grid item xs style={{textAlign: 'center'}}>
        <h3>Статус:</h3>
        <p style={{textAlign: 'center', color: !Error.msg ? Log.clr : Error.clr, opacity: 0.5}}>{!Error.msg ? Log.msg : Error.msg}</p>
      </Grid>
    </Grid>
  </Box>);
}

export default App;
