import './AppCalculator.css';
import { useState, useEffect, useReducer } from "react";
import { AppButton } from './AppButton';
import { AppCalculationHistory } from './AppCalculationHistory';
import { useKalkulator } from "./useKalkulator";
const STORAGE_KEY = 'kalkulator_historia';

function statusReducer(state, action) {
  switch (action.type) {
    case "INIT":
      return "Brak";
    case "ZMIEN_A":
      return "Zmodyfikowano wartość liczby A";
    case "ZMIEN_B":
      return "Zmodyfikowano wartość liczby B";
    case "OBLICZ":
      return "Wykonano obliczenia";
    case "PRZYWRÓĆ":
      return "Przywrócono historyczny stan";
    default:
      return state;
  }
}

export function AppCalculator() {
    const [liczbaA, setLiczbaA] = useState(null);
    const [liczbaB, setLiczbaB] = useState(null);
    const [wynik, setWynik] = useState(null);
    const [historia, setHistoria] = useState([]);
    const [porownanie, setPorownanie] = useState('');

    const [ostatniaCzynnosc, dispatch] = useReducer(statusReducer, "Brak");

    const { dodaj, odejmij, pomnoz, podziel } = useKalkulator({
        liczbaA,
        liczbaB,
        historia,
        setHistoria,
        setWynik,
    });

    function onDodaj() {
        dodaj();
        dispatch({ type: "OBLICZ" });
    }

    function onOdejmij() {
        odejmij();
        dispatch({ type: "OBLICZ" });
    }

    function onPomnoz() {
        pomnoz();
        dispatch({ type: "OBLICZ" });
    }

    function onPodziel() {
        podziel();
        dispatch({ type: "OBLICZ" });
    }
    
    useEffect(() => {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        try {
            const zapisanaHistoria = JSON.parse(raw);

            if (Array.isArray(zapisanaHistoria)) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setHistoria(zapisanaHistoria);

                if (zapisanaHistoria.length > 0) {
                    const last = zapisanaHistoria[zapisanaHistoria.length - 1];
                    setLiczbaA(last.a);
                    setLiczbaB(last.b);
                    setWynik(last.wynik);
                }
            }
        } catch {
            sessionStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    useEffect(() => {
        if (historia.length > 0) {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(historia));
        } else {
            sessionStorage.removeItem(STORAGE_KEY);
        }
    }, [historia]);


    function liczbaAOnChange(value) {
        setLiczbaA(parsujLiczbe(value));
        dispatch({ type: "ZMIEN_A" });
    }

    function parsujLiczbe(value) {
        const sparsowanaLiczba = parseFloat(value);
        if(isNaN(sparsowanaLiczba)) {
            return null;
        } else {
            return sparsowanaLiczba;
        } 
    }

    function liczbaBOnChange(value) {
        setLiczbaB(parsujLiczbe(value));
        dispatch({ type: "ZMIEN_B" });
    }

    function onAppCalculationHistoryClick(index) {
        const nowaHistoria = historia.slice(0, index + 1);
        setHistoria(nowaHistoria);
        setLiczbaA(historia[index].a);
        setLiczbaB(historia[index].b);
        setWynik(historia[index].wynik);
        dispatch({ type: "PRZYWRÓĆ" });
    }

    useEffect(() => {
        if (liczbaA == null || liczbaB == null) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPorownanie('');
        } else if (liczbaA === liczbaB) {
            setPorownanie('Liczba A jest równa liczbie B.');
        } else if (liczbaA > liczbaB) {
            setPorownanie('Liczba A jest większa od liczby B.');
        } else {
            setPorownanie('Liczba B jest większa od liczby A.aaa');
        }
    }, [liczbaA, liczbaB]);


    let zablokujPrzyciski = liczbaA == null || liczbaB == null;
    let zablokujDzielenie = zablokujPrzyciski || liczbaB === 0;


    return (
    <div className='app-calculator'>
        <div className='app-calculator-pole'>
            <label>Wynik: </label>
            <span>{wynik}</span>
        </div>
        <hr />

        <div className="app-calculator-pole">
             <label>Ostatnia czynność: </label>
            <span>{ostatniaCzynnosc}</span>
        </div>
        <hr />

        <div className='app-calculator-pole'>
            <label>Dynamiczne porównanie liczb: </label>
            <span>{porownanie}</span>
        </div>

        <hr />

        <div className='app-calculator-pole'>
            <label htmlFor="liczba1">Liczba 1</label>
            <input id="liczba1" type="number" value={liczbaA} onChange={(e) => liczbaAOnChange(e.target.value)} name="liczba1" />
        </div>
        <div className='app-calculator-pole'>
            <label htmlFor="liczba2">Liczba 2</label>
            <input id="liczba2" type="number" value={liczbaB} onChange={(e) => liczbaBOnChange(e.target.value)} name="liczba2" />
        </div>

        <hr />

        <div className='app-calculator-przyciski'>
            <AppButton disabled={zablokujPrzyciski} title="+" onClick={onDodaj}/>
            <AppButton disabled={zablokujPrzyciski} title="-" onClick={onOdejmij}/>
            <AppButton disabled={zablokujPrzyciski} title="*" onClick={onPomnoz}/>
            <AppButton disabled={zablokujDzielenie} title="/" onClick={onPodziel}/>
        </div>

        <hr />
        
        <div className='app-calculator-historia'>
            <AppCalculationHistory historia={historia} onClick={(index) => onAppCalculationHistoryClick(index)}/>
        </div>
    </div>)
}