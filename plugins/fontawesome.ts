import { library, config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faCamel } from "~/assets/icons/faCamel";
import { faPlay } from "~/assets/icons/faPlay";
// import { faIcon } from "@fortawesome/free-solid-svg-icons";
// library.add(faIcon);

config.autoAddCss = false;
library.add(faCamel, faPlay);

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("font-awesome-icon", FontAwesomeIcon);
});
