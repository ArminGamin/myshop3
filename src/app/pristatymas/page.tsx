import type { Metadata } from "next";
import { store } from "@/lib/config/store.config";
import { productPhotoDisclaimer } from "@/lib/copy/product-disclaimer";
import { InfoPage } from "@/components/layout/info-page";

export const metadata: Metadata = {
  title: "Pristatymo informacija",
  description:
    "Pristatymas į visą Lietuvą per 4–6 dienas. Nemokamas pristatymas nuo 80 €. Užsakymams iki 80 € – 2,99 €.",
  alternates: { canonical: "/pristatymas" },
};

export default function ShippingPage() {
  const free = store.shipping.freeThresholdCents / 100;
  const rate = (store.shipping.flatRateCents / 100).toFixed(2).replace(".", ",");

  return (
    <InfoPage title="Pristatymo informacija">
      <p>
        Įprastai užsakymus pristatome per 4–6 dienas, priklausomai nuo užsakymo kiekio,
        prekės tiekėjo sandėlio lokacijos ir pristatymo vietos.
      </p>
      <p>
        Kadangi bendradarbiaujame su tarptautiniais tiekėjais, dalis prekių gali būti
        siunčiama iš užsienio sandėlių, todėl jų pristatymas į Lietuvą tam tikrais atvejais
        gali užtrukti ilgiau.
      </p>
      <p>
        Didesnio užimtumo laikotarpiais, esant padidėjusiam užsakymų kiekiui, tiekėjų ar
        kurjerių apkrovai, pristatymas gali užtrukti iki 16 dienų.
      </p>
      <p>
        Dedame visas pastangas, kad prekės klientus pasiektų kuo greičiau. Pateikdamas
        užsakymą klientas patvirtina, kad susipažino su pristatymo informacija ir supranta,
        jog pristatymo terminas gali priklausyti nuo tiekėjų, kurjerių bei užsakymų srauto.
      </p>
      <p>{productPhotoDisclaimer.shipping}</p>
      <p>
        Užsakymams virš {free} € taikomas nemokamas pristatymas. Užsakymams iki {free} €
        pristatymo kaina — {rate} €.
      </p>
    </InfoPage>
  );
}
