import { Link } from "react-router-dom";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link aria-label="Leegality Home" className={styles.brand} to="/">
          <img alt="Leegality" className={styles.logo} src="/logo.svg" />
        </Link>
      </div>
    </header>
  );
}
