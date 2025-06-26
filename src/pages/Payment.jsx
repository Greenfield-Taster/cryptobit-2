import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import {
  createExchangeRequest,
  clearCurrentExchange,
  selectExchangeStatus,
  selectExchangeError,
} from "../store/slices/exchangeSlice";
import "../scss/main.scss";
import walletIcon from "../assets/images/wallet.png";
import copyIcon from "../assets/images/copy.png";

const WALLET_ADDRESSES = {
  bitcoin: {
    address: "bc1qrm902nf5kanqlysfklfq82xpe3ut42juqy0ll5",
    network: "BTC",
  },
  usdt: {
    address: "TRoVZ2R8fmKYLACU86ypsWF3TjRLxsnHyg",
    network: "TRC20",
  },
  ethereum: {
    address: "0x5b37cB32C7861fa43882E2577B9277236Ab6b57E",
    network: "ETH",
  },
  solana: {
    address: "BUyAGgdtY3bsuJXeiqhHWT7wQt9J17NvKRd3ZDpoHCJB",
    network: "SOL",
  },
  xrp: {
    address: "rhLWkxbd76tiAJcndkFHWivgoKPBd9kF32",
    network: "XRP",
  },
  binancecoin: {
    address: "0x5b37cB32C7861fa43882E2577B9277236Ab6b57E",
    network: "BNB Smart Chain",
  },
  dogecoin: {
    address: "DU6r5QH5jEsff9Pdeqoy1QrUydJUwTtF1K",
    network: "DOGE",
  },
  "usd-coin": {
    address: "TRoVZ2R8fmKYLACU86ypsWF3TjRLxsnHyg",
    network: "TRON",
  },
  cardano: {
    address:
      "addr1qxd70e6gj4lgxmr6hx9xed2wfwwfkvhldvqnjvl6hherwxmm8qeuyelknr0djphq220z2d69ahjg2und34xc6p4ln7wsh6jnsj",
    network: "ADA",
  },
  "staked-ether": {
    address: "BUyAGgdtY3bsuJXeiqhHWT7wQt9J17NvKRd3ZDpoHCJB",
    network: "Lido",
  },
  "avalanche-2": {
    address: "0x5b37cB32C7861fa43882E2577B9277236Ab6b57E",
    network: "AVAX",
  },
  tron: {
    address: "TRoVZ2R8fmKYLACU86ypsWF3TjRLxsnHyg",
    network: "TRON",
  },
  "ton-token": {
    address: "TRoVZ2R8fmKYLACU86ypsWF3TjRLxsnHyg",
    network: "TRON",
  },
  stellar: {
    address: "GD33EPD6LEBREX2DJCLKZW244DEYSL3S5I55F6O3MIU7FGY47XM5CFWB",
    network: "XLM",
  },
  "shiba-inu": {
    address: "0x5b37cB32C7861fa43882E2577B9277236Ab6b57E",
    network: "ETH",
  },
};

const DEFAULT_WALLET = {
  address: "TRoVZ2R8fmKYLACU86ypsWF3TjRLxsnHyg",
  network: "TRC20",
};

function Payment() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [copied, setCopied] = useState(false);
  const [localError, setLocalError] = useState(null);

  const exchangeStatus = useSelector(selectExchangeStatus);
  const exchangeError = useSelector(selectExchangeError);

  const paymentData =
    location.state ||
    JSON.parse(localStorage.getItem(`payment_data_${orderId}`));

  const walletData = paymentData?.fromCrypto
    ? WALLET_ADDRESSES[paymentData.fromCrypto.toLowerCase()] || DEFAULT_WALLET
    : DEFAULT_WALLET;

  useEffect(() => {
    if (location.state) {
      localStorage.setItem(
        `payment_data_${orderId}`,
        JSON.stringify(location.state)
      );
    }
  }, [location.state, orderId]);

  useEffect(() => {
    const paymentStatus = localStorage.getItem(`payment_${orderId}`);
    if (paymentStatus === "completed") {
      navigate("/payment-success", {
        state: {
          orderId,
          fromCrypto: paymentData?.fromCrypto,
          amount: paymentData?.amount,
        },
        replace: true,
      });
    }
  }, [orderId, navigate, paymentData]);

  const closeRequest = () => {
    navigate("/", { replace: true });
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    return () => {
      dispatch(clearCurrentExchange());
    };
  }, [dispatch]);

  const handleCopyWallet = async () => {
    try {
      await navigator.clipboard.writeText(walletData.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setLocalError(t("payment.copyError"), err);
      setTimeout(() => setLocalError(null), 3000);
    }
  };

  const handleSubmit = async () => {
    if (!orderId || !paymentData) {
      setLocalError(t("payment.missingData"));
      return;
    }

    try {
      const submissionData = {
        orderId: orderId,
        fromCrypto: paymentData.fromCrypto,
        toCrypto: paymentData.toCrypto,
        amount: paymentData.amount,
        calculatedAmount: paymentData.calculatedAmount,
        senderWallet: paymentData.senderWallet,
        recipientWallet: paymentData.recipientWallet,
        saveFromWallet: paymentData.saveFromWallet || false,
        promoCode: paymentData.promoCode || null,
      };

      const resultAction = await dispatch(
        createExchangeRequest(submissionData)
      );

      if (createExchangeRequest.fulfilled.match(resultAction)) {
        localStorage.setItem(`payment_${orderId}`, "processing");

        navigate("/payment-success", {
          state: {
            orderId,
            fromCrypto: paymentData.fromCrypto,
            amount: paymentData.amount,
          },
          replace: true,
        });
        window.scrollTo(0, 0);
      }
    } catch (error) {
      setLocalError(error.message || t("payment.unknownError"));
    }
  };

  if (!paymentData) {
    return (
      <div className="payment-error-page">
        <h2>{t("payment.titleError")}</h2>
        <p>{t("payment.textError")}</p>
        <button
          className="btn-primary"
          onClick={() => navigate("/", { replace: true })}
        >
          {t("payment.goHome")}
        </button>
      </div>
    );
  }

  return (
    <section className="payment">
      <div className="payment__container">
        <div className="payment__content">
          <div className="payment__header">
            <h1>
              {t("payment.title")} #{orderId}
            </h1>
            <p className="processing-info">{t("payment.info")}</p>
            <p className="commission-info">{t("payment.commission")}</p>
          </div>

          <div className="payment__exchange">
            <div className="exchange-item">
              <div className="exchange-icon">
                <img src={walletIcon} alt="Give away" />
              </div>
              <div className="exchange-details">
                <span className="exchange-label">{t("payment.label")}</span>
                <span className="exchange-value">
                  {paymentData.amount} {paymentData.fromCrypto}
                </span>
              </div>
            </div>

            <div className="exchange-item">
              <div className="exchange-icon">
                <img src={walletIcon} alt="You receive" />
              </div>
              <div className="exchange-details">
                <span className="exchange-label">{t("payment.receive")}</span>
                <span className="exchange-value">
                  {paymentData.calculatedAmount} {paymentData.toCrypto}
                </span>
              </div>
            </div>

            {paymentData.promoCode && (
              <div className="exchange-item promo-code-info">
                <div className="exchange-icon promo-code-icon">
                  <i className="fas fa-ticket-alt"></i>
                </div>
                <div className="exchange-details">
                  <span className="exchange-label">
                    {t("payment.promoCode")}
                  </span>
                  <span className="exchange-value">
                    {paymentData.promoCode}
                    {paymentData.promoCodeDiscount && (
                      <span className="promo-bonus">
                        +{paymentData.promoCodeDiscount}%
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="payment__form">
            <h2>{t("payment.formTitle")}</h2>

            <div className="form-group">
              <label>{t("payment.formLabel")}</label>
              <div className="form-value">{walletData.network}</div>
            </div>

            <div className="form-group">
              <label>{t("payment.formWallet")}</label>
              <div
                className="form-value wallet-field"
                onClick={handleCopyWallet}
              >
                <span className="wallet-address">{walletData.address}</span>
                <img src={copyIcon} alt="copy" className="copy-icon" />
                {copied && (
                  <span className="copy-notification">{t("payment.copy")}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>{t("payment.cryptocurrency")}</label>
              <div className="form-value">{paymentData.fromCrypto}</div>
            </div>

            <div className="form-group">
              <label>{t("payment.request")}</label>
              <div className="form-value">#{orderId}</div>
            </div>

            <div className="form-status">
              <h3>{t("payment.status")}</h3>
              <p>{t("payment.formDescription")}</p>
              <div className="status-value">{t("payment.paymentExpected")}</div>
            </div>

            {(exchangeError || localError) && (
              <div className="form-error">{localError || exchangeError}</div>
            )}

            <div className="form-actions">
              <button
                className="btn-secondary"
                onClick={closeRequest}
                disabled={exchangeStatus === "loading"}
              >
                {t("payment.closeRequest")}
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={exchangeStatus === "loading"}
              >
                {exchangeStatus === "loading" ? (
                  <span className="loading-spinner">
                    {t("payment.processing")}
                  </span>
                ) : (
                  t("payment.paid")
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Payment;
