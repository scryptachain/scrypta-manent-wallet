<template>
  <div>
    <b-loading
      :is-full-page="true"
      :active.sync="isLoading"
      :can-cancel="false"
    ></b-loading>
    <div class="page" v-if="!isLoading">
      <b-loading :is-full-page="true" :active.sync="isLoading"></b-loading>
      <div style="position: relative">
        <h1
          class="is-title is-2"
          style="
            position: absolute;
            top: 0;
            right: 0;
            font-size: 14px;
            text-align: right;
          "
        >
          {{ balance }}<br />{{ ticker }}
        </h1>
        <h1 class="is-title is-2" style="margin-top: 8px; text-align: left">
          {{ $t("dashboard.welcome_back") }}
          <div style="font-size: 14px; margin-top: -15px">
            <br />{{ wallet.master.substr(0, 6) }}...{{
              wallet.master.substr(-6)
            }}
            <button v-clipboard="wallet.master">copy</button>
          </div>
        </h1>
      </div>
      <apexchart
        v-if="!isLoading && confirmed.length > 0"
        height="300px"
        width="100%"
        type="line"
        :options="options"
        :series="series"
      ></apexchart>
      <div
        v-if="confirmed.length === 0"
        style="padding: 50px 0; text-align: center"
      >
        {{ $t("dashboard.no_txs") }}
      </div>
      <div
        v-if="unconfirmed.length > 0"
        style="padding: 0 20px; text-align: left"
      >
        <b>{{ $t("dashboard.pending_transactions") }}</b>
        <br />
        <br />
        <div
          class="card"
          v-for="tx in unconfirmed"
          v-bind:key="tx.txid"
          style="margin-bottom: 5px"
        >
          <div class="card-content">
            <div class="media">
              <div class="media-left">
                <figure class="image is-48x48">
                  <v-gravatar :email="tx.from" />
                </figure>
              </div>
              <div class="media-content">
                <p class="title is-4">
                  <span v-if="tx.value > 0">
                    <img src="/img/received.png" style="height: 15px" />
                  </span>
                  <span v-if="tx.value < 0">
                    <img src="/img/sent.png" style="height: 15px" />
                  </span>
                  {{ formatPrice(tx.value).replace("-", "") }} {{ ticker }}
                </p>
                <p class="subtitle is-6">
                  <span v-if="tx.value > 0">{{ $t("from") }}</span>&nbsp;
                  <span v-if="tx.value <= 0">{{ $t("dashboard.to") }}</span>
                  <b>{{ tx.from.substr(0, 3) }}...{{ tx.from.substr(-3) }}</b>
                </p>
              </div>
            </div>
          </div>
        </div>
        <br />
      </div>
      <div
        v-if="confirmed.length > 0"
        style="padding: 0 20px; text-align: left"
      >
        <b>{{ $t("dashboard.latest_transactions") }}</b>
        <br />
        <br />
        <div
          class="card"
          v-for="tx in confirmed.slice(0, chunkSize)"
          v-bind:key="tx.txid"
          style="margin-bottom: 5px"
        >
          <div class="card-content">
            <div class="media">
              <div class="media-left">
                <figure class="image is-48x48">
                  <span v-if="tx.value > 0 || tx.to.length === 0">
                    <v-gravatar :email="tx.from" />
                  </span>
                  <span v-if="tx.value < 0 && tx.to.length > 0">
                    <v-gravatar :email="tx.to" />
                  </span>
                </figure>
              </div>
              <div class="media-content" style="overflow: hidden">
                <p class="title is-4" style="font-size: 20px">
                  <span v-if="tx.value > 0">
                    <img src="/img/received.png" style="height: 15px" />
                  </span>
                  <span v-if="tx.value < 0">
                    <img src="/img/sent.png" style="height: 15px" />
                  </span>
                  {{ formatPrice(tx.value).replace("-", "") }} {{ ticker }}
                </p>
                <p class="subtitle is-6" style="font-size: 12px">
                  {{ $t("dashboard.atTime") }}
                  <b>{{ tx.date }}</b>
                  <br />
                  <span v-if="tx.value > 0">
                    {{ $t("dashboard.from") }}
                    <b>{{ tx.from.substr(0, 3) }}...{{ tx.from.substr(-3) }}</b>
                  </span>
                  <span v-if="tx.value < 0 && tx.to.length > 0">
                    {{ $t("dashboard.to") }}
                    <b>{{ tx.to.substr(0, 3) }}...{{ tx.to.substr(-3) }}</b>
                  </span>
                  <span v-if="tx.value < 0 && tx.to.length === 0">
                    {{ $t("dashboard.stored") }}
                  </span>
                </p>
              </div>
              <a
                :href="
                  'https://explorer.scryptachain.org/transaction/' + tx.txid
                "
                target="_blank"
              >
                <b-icon
                  icon="share"
                  style="
                    position: absolute;
                    cursor: pointer;
                    top: 40px;
                    z-index: 25;
                    right: 40px;
                  "
                ></b-icon
              ></a>
            </div>
          </div>
        </div>
        <br />
        <div class="text-center">
          <b-button
            v-if="confirmed.length > chunkSize"
            @click="showMore"
            type="is-primary"
            >{{ $t("dashboard.showmore") }}</b-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
let ScryptaCore = require("@scrypta/core");
import User from "../libs/user";
const t2d = require("timestamp-to-date");

export default {
  name: "LyraDash",
  data() {
    return {
      scrypta: new ScryptaCore(true),
      configs: {},
      wallet: "",
      chunkSize: 5,
      ticker: "",
      options: {
        xaxis: {
          categories: [],
          type: "datetime",
        },
        colors: ["#D8213B"],
      },
      series: [
        {
          name: "LYRA",
          data: [],
        },
      ],
      transactions: [],
      confirmed: [],
      unconfirmed: [],
      movements: {},
      graph: {},
      balance: 0,
      isLogging: true,
      isLoading: true,
      error: "",
    };
  },
  async mounted() {
    const app = this;
    app.wallet = await User.auth();
    app.scrypta.staticnodes = true
    if (app.wallet !== false) {
      app.configs = await User.configs();
      app.ticker = "LYRA";
      await app.fetchTransactions();
      app.isLoading = false;
      setInterval(function () {
        app.fetchTransactions();
      }, 15000);
    }
  },
  methods: {
    fetchTransactions() {
      const app = this;
      return new Promise(async (response) => {
        let balance = await app.scrypta.get("/balance/" + app.wallet.master);
        app.balance = balance.balance;
        app.options.xaxis.categories = [];
        app.series[0].data = [];
        app.transactions = await app.scrypta.get(
          "/transactions/" + app.wallet.master
        );
        let transactions = app.transactions.data.reverse();
        let unconfirmed = app.transactions.unconfirmed;
        let initDate;
        let endDate;
        let last = transactions.length - 1;

        for (let x in transactions) {
          let transaction = app.transactions.data[x];
          let date = app.getDate(transaction.time * 1000);
          if (initDate === undefined) {
            initDate = date;
          }
          if (parseFloat(x) === parseFloat(last)) {
            endDate = date;
          }
          if (app.movements[date] === undefined) {
            app.movements[date] = 0;
          }
          app.movements[date] += transaction.value;
        }

        var getDaysArray = function (s, e) {
          for (
            var a = [], d = new Date(s);
            d <= e;
            d.setDate(d.getDate() + 1)
          ) {
            a.push(app.getDate(d));
          }
          return a;
        };
        var daylist = getDaysArray(new Date(initDate), new Date(endDate));

        for (let y in daylist) {
          let day = daylist[y];
          let timestamp = new Date(day).getTime();
          let prev = new Date(daylist[y - 1]).getTime();

          let daybalance = 0;
          let previous = app.graph[prev];
          if (previous !== undefined) {
            daybalance = previous;
          }
          if (app.movements[day] !== undefined) {
            daybalance += app.movements[day];
          }
          app.graph[timestamp] = parseFloat(daybalance.toFixed(8));
        }
        for (let time in app.graph) {
          app.options.xaxis.categories.push(parseInt(time));
          app.series[0].data.push(app.graph[time]);
        }
        if (unconfirmed.length > 0) {
          app.unconfirmed = []
          for (let x in unconfirmed) {
            let transaction = unconfirmed[x];
            if (
              (transaction.to[1] !== undefined &&
                transaction.from[0] !== transaction.to[1]) ||
              (transaction.to[1] === undefined &&
                transaction.from[0] !== transaction.to[0])
            ) {
              transaction.date = t2d(
                transaction.time * 1000,
                "dd/MM/yyyy HH:mm"
              );
              transaction.from = transaction.from[0];
              if (transaction.to[1] !== undefined) {
                transaction.to = transaction.to[1];
              }
              app.unconfirmed.push(transaction);
            }
          }
        }

        app.transactions = app.transactions.data.reverse();
        app.confirmed = [];
        for (let x in app.transactions) {
          let transaction = app.transactions[x];
          if (
            (transaction.to[1] !== undefined &&
              transaction.from[0] !== transaction.to[1]) ||
            (transaction.to[1] === undefined &&
              transaction.from[0] !== transaction.to[0])
          ) {
            transaction.date = t2d(transaction.time * 1000, "dd/MM/yyyy HH:mm");
            transaction.from = transaction.from[0];
            if (transaction.to[1] !== undefined) {
              transaction.to = transaction.to[1];
            }
            app.confirmed.push(transaction);
          }
        }
        response(true);
      });
    },
    formatPrice(value) {
      const app = this;
      try {
        value = parseFloat(value);
      } catch (e) {
        app.error = "NaN";
      }
      if (app.configs.chain === "LYRA") {
        let val = (value / 1).toFixed(8).replace(".", ",");
        return val;
      } else {
        let val = (value / 1).toFixed(app.configs.decimals).replace(".", ",");
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      }
    },
    getDate(time) {
      let date = new Date(time);
      let y = date.getFullYear();
      let m = date.getMonth() + 1;
      let d = date.getDate();
      return y + "-" + m + "-" + d;
    },
    getTime(time) {
      let date = new Date(time);
      let h = `${date.getHours()}`.padStart(2, "0");
      let m = `${date.getMinutes()}`.padStart(2, "0");
      let s = `${date.getSeconds()}`.padStart(2, "0");
      return h + ":" + m + ":" + s;
    },
    showMore() {
      const app = this;
      let size = app.chunkSize + 5;
      if (size <= app.confirmed.length) {
        app.chunkSize = size;
      }
    },
  },
};
</script>