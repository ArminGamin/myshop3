import type { Metadata } from "next";
import { store } from "@/lib/config/store.config";
import { productPhotoDisclaimer } from "@/lib/copy/product-disclaimer";
import { InfoPage } from "@/components/layout/info-page";

export const metadata: Metadata = {
  title: "Pristatymo informacija",
  description:
    "Pristatymas į visą Lietuvą per 3–4 dienas. Nemokamas pristatymas nuo 24,99 €. Į paštomatą 1,99 €, į namus 2,99 €.",
  alternates: { canonical: "/pristatymas" },
};

export default function ShippingPage() {
  const free = (store.shipping.freeThresholdCents / 100).toFixed(2).replace(".", ",");
  const rate = (store.shipping.flatRateCents / 100).toFixed(2).replace(".", ",");
  const pickupRate = (store.shipping.pickupRateCents / 100).toFixed(2).replace(".", ",");

  return (
    <InfoPage title="Pristatymo informacija">
      <p>
        Įprastai užsakymus pristatome per 3–4 dienas, priklausomai nuo užsakymo kiekio ir
        pristatymo vietos.
      </p>
      <p>
        Dedame visas pastangas, kad prekės klientus pasiektų kuo greičiau. Pateikdamas
        užsakymą klientas patvirtina, kad susipažino su pristatymo informacija ir supranta,
        jog pristatymo terminas gali priklausyti nuo kurjerių bei užsakymų srauto.
      </p>
      <p>{productPhotoDisclaimer.shipping}</p>
      <p>
        Užsakymams nuo {free} € taikomas nemokamas pristatymas. Užsakymams iki {free} €
        pristatymas į Omniva, LP Express ar DPD paštomatą kainuoja {pickupRate} €, kurjeriu į namus — {rate} €.
      </p>
    </InfoPage>
  );
}
