import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useCommunity } from "../../context/community.context.jsx";
import { BLOOD_GROUPS } from "../../constants/blood-group.constant.js";
import {
  InputLabel,
  SelectOptionField,
  TextInputField,
} from "../../components/form/input.component.jsx";
import Icon from "../../components/icons/icons.component.jsx";
import CommunityStats from "../../components/community/community-stats.component.jsx";
import DonorResults from "./donor-results.component.jsx";
import donorSvc from "./donor.service.js";

const searchDto = Yup.object({
  bloodGroup: Yup.string().oneOf(["", ...BLOOD_GROUPS]),
  city: Yup.string()
    .trim()
    .max(80)
    .test(
      "city",
      "Enter at least 2 characters for the city.",
      (value) => !value || value.length >= 2,
    ),
});

const DonorSearchPage = () => {
  const { openModal, revision } = useCommunity();
  const [filters, setFilters] = useState({
    bloodGroup: "",
    city: "",
    available: "true",
  });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(searchDto),
    defaultValues: { bloodGroup: "", city: "" },
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== ""),
    );
    donorSvc
      .listAllDonors(params)
      .then((response) => {
        if (active) {
          setRecords(response.data.data);
          setError("");
        }
      })
      .catch((exception) => {
        if (active) setError(exception.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filters, revision]);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span />
            EVERY DROP CONNECTS US
          </div>
          <h1 className="hero-title">
            Find a donor.
            <br />
            <em>Make a difference.</em>
          </h1>
          <p className="hero-description">
            A helping hand could be closer than you think. Connect with blood
            donors in your city, when it matters most.
          </p>
          <button
            className="button primary"
            onClick={() => openModal({ type: "request" })}
          >
            <Icon name="plus" />
            Request blood
          </button>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <span className="orbit-dot dot-one" />
          <span className="orbit-dot dot-two" />
          <div className="hero-art-icon">
            <Icon name="drop" />
            <span>
              <Icon name="heart" />
            </span>
          </div>
          <span className="hero-art-caption">
            A little of you.
            <br />
            <strong>A life for someone.</strong>
          </span>
          <span className="hero-float float-one">O+</span>
          <span className="hero-float float-two">A+</span>
        </div>
      </section>
      <CommunityStats />
      <section className="search-panel" aria-labelledby="search-heading">
        <h2 id="search-heading" className="search-heading">
          Let's find your match
        </h2>
        <form
          className="search-fields"
          onSubmit={handleSubmit((data) =>
            setFilters((current) => ({ ...current, ...data })),
          )}
          noValidate
        >
          <div className="field">
            <InputLabel field="search-group" labelTxt="Blood group" />
            <div className="input-wrap">
              <Icon name="drop" />
              <SelectOptionField
                control={control}
                name="bloodGroup"
                id="search-group"
                errMsg={errors.bloodGroup?.message}
                showError={false}
                placeholder="All blood groups"
                options={BLOOD_GROUPS.map((value) => ({ value, label: value }))}
              />
            </div>
            {errors.bloodGroup && (
              <span
                id="search-group-error"
                className="field-error"
                role="alert"
              >
                {errors.bloodGroup.message}
              </span>
            )}
          </div>
          <div className="field">
            <InputLabel field="search-city" labelTxt="City" />
            <div className="input-wrap">
              <Icon name="pin" />
              <TextInputField
                control={control}
                name="city"
                id="search-city"
                errMsg={errors.city?.message}
                showError={false}
                placeholder="Enter a city, e.g. Pune"
                maxLength={80}
              />
            </div>
            {errors.city && (
              <span id="search-city-error" className="field-error" role="alert">
                {errors.city.message}
              </span>
            )}
          </div>
          <button className="button primary search-submit" type="submit">
            <Icon name="search" />
            Find donors
          </button>
        </form>
      </section>
      <section aria-labelledby="donor-results-heading">
        <div className="results-toolbar">
          <div>
            <h2 id="donor-results-heading" className="results-heading">
              People ready to help
              <span className="results-count">
                {loading ? "…" : records.length}
              </span>
            </h2>
            <p className="results-caption">
              {filters.city
                ? `Matching donors in ${filters.city}. Reach out directly to connect.`
                : "Find a familiar blood type. Reach out to make a connection."}
            </p>
          </div>
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={filters.available === "true"}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  available: event.target.checked ? "true" : "",
                }))
              }
            />
            <span className="toggle-switch" />
            <span>Available only</span>
          </label>
        </div>
        <DonorResults records={records} loading={loading} error={error} />
      </section>
    </>
  );
};

export default DonorSearchPage;
