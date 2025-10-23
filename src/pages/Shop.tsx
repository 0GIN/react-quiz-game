import '../styles/ui.css'
import { Card } from '../components'
import flashPoint from '../assets/flash_point.png'

export default function Shop() {
  return (
    <main className="main" role="main">
      <Card title="🛒 Sklep Punktów" className="shop-page">
        <div className="shop-balance">
          <span>Twoje punkty:</span>
          <div className="balance-amount">
            <img src={flashPoint} alt="" className="point-icon-large" />
            <span>1,250</span>
          </div>
        </div>

        <div className="shop-categories">
          <button className="shop-cat-btn active">Wszystko</button>
          <button className="shop-cat-btn">Awatary</button>
          <button className="shop-cat-btn">Odznaki</button>
          <button className="shop-cat-btn">Boosty</button>
          <button className="shop-cat-btn">Motywy</button>
        </div>

        <div className="shop-grid">
          <div className="shop-item">
            <div className="item-preview">🎨</div>
            <h3 className="item-name">Neonowy Awatar</h3>
            <p className="item-desc">Ekskluzywny awatar z efektem neonowym</p>
            <div className="item-price">
              <img src={flashPoint} alt="" className="point-icon" />
              <span>500</span>
            </div>
            <button className="btn-buy">Kup teraz</button>
          </div>

          <div className="shop-item premium">
            <div className="premium-badge">PREMIUM</div>
            <div className="item-preview">💎</div>
            <h3 className="item-name">Diamentowa Ramka</h3>
            <p className="item-desc">Luksusowa ramka dla najlepszych</p>
            <div className="item-price">
              <img src={flashPoint} alt="" className="point-icon" />
              <span>1,000</span>
            </div>
            <button className="btn-buy">Kup teraz</button>
          </div>

          <div className="shop-item">
            <div className="item-preview">⚡</div>
            <h3 className="item-name">XP Boost 2x</h3>
            <p className="item-desc">Podwójne XP przez 24 godziny</p>
            <div className="item-price">
              <img src={flashPoint} alt="" className="point-icon" />
              <span>300</span>
            </div>
            <button className="btn-buy">Kup teraz</button>
          </div>

          <div className="shop-item">
            <div className="item-preview">🏅</div>
            <h3 className="item-name">Odznaka Mistrza</h3>
            <p className="item-desc">Pokaż wszystkim swoją klasę</p>
            <div className="item-price">
              <img src={flashPoint} alt="" className="point-icon" />
              <span>750</span>
            </div>
            <button className="btn-buy">Kup teraz</button>
          </div>

          <div className="shop-item">
            <div className="item-preview">🌈</div>
            <h3 className="item-name">Tęczowy Motyw</h3>
            <p className="item-desc">Kolorowy motyw interfejsu</p>
            <div className="item-price">
              <img src={flashPoint} alt="" className="point-icon" />
              <span>600</span>
            </div>
            <button className="btn-buy owned">Posiadasz</button>
          </div>

          <div className="shop-item">
            <div className="item-preview">🔥</div>
            <h3 className="item-name">Ochrona Passy</h3>
            <p className="item-desc">Jedna przegrana nie zeruje passy</p>
            <div className="item-price">
              <img src={flashPoint} alt="" className="point-icon" />
              <span>400</span>
            </div>
            <button className="btn-buy">Kup teraz</button>
          </div>
        </div>
      </Card>
    </main>
  )
}
