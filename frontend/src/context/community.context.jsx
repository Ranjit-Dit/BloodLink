import { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import donorSvc from "../pages/donor/donor.service.js";
import bloodRequestSvc from "../pages/blood-request/blood-request.service.js";
import { getRecordId } from "../utilities/helpers.jsx";

const CommunityContext = createContext(null);

export const CommunityProvider = ({ children }) => {
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(null);
  const [revision, setRevision] = useState(0);
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [formPending, setFormPending] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [demoBusy, setDemoBusy] = useState(false);
  const mutationLock = useRef(false);
  const demoLock = useRef(false);

  const refresh = () => setRevision((value) => value + 1);
  const notify = (message, type = "success") => {
    setFeedback({ message, type });
    toast[type === "error" ? "error" : "success"](message);
  };
  const openModal = (next) => {
    setFeedback(null);
    setModal(next);
  };
  const closeModal = () => {
    if (!mutationLock.current && !formPending) {
      setModal(null);
      setFeedback(null);
    }
  };
  const saved = (message) => {
    setModal(null);
    refresh();
    notify(message);
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([donorSvc.listAllDonors(), bloodRequestSvc.listAllRequests()])
      .then(([donorResponse, requestResponse]) => {
        if (!active) return;
        setDonors(donorResponse.data.data);
        setRequests(requestResponse.data.data);
        setError("");
        setConnected(true);
      })
      .catch((exception) => {
        if (active) {
          setError(exception.message);
          setConnected(false);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [revision]);

  const mutate = async (operation, message, close = false) => {
    if (mutationLock.current) return;
    mutationLock.current = true;
    setBusy(true);
    try {
      await operation();
      if (close) setModal(null);
      refresh();
      notify(message);
    } catch (exception) {
      notify(exception.message, "error");
    } finally {
      mutationLock.current = false;
      setBusy(false);
    }
  };

  const copy = async (
    text,
    message = "Message copied. You can send it to the donor.",
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      notify(message);
    } catch {
      notify(
        "Clipboard access is unavailable. You can select and copy the text manually.",
        "error",
      );
    }
  };

  const findMatches = async (request) => {
    openModal({
      type: "matches",
      request,
      loading: true,
      donors: [],
      error: "",
    });
    try {
      const response = await bloodRequestSvc.findMatchingDonors(
        getRecordId(request),
      );
      setModal((current) =>
        current?.type === "matches" &&
        getRecordId(current.request) === getRecordId(request)
          ? { ...current, loading: false, donors: response.data.data }
          : current,
      );
    } catch (exception) {
      setModal((current) =>
        current?.type === "matches" &&
        getRecordId(current.request) === getRecordId(request)
          ? { ...current, loading: false, error: exception.message }
          : current,
      );
    }
  };

  const loadDemo = async () => {
    if (demoLock.current) return;
    demoLock.current = true;
    setDemoBusy(true);
    try {
      const response = await donorSvc.listAllDonors();
      const examples = [
        {
          name: "Asha Rao",
          bloodGroup: "O+",
          phone: "+12025550101",
          city: "Pune",
          area: "Shivajinagar",
          available: true,
        },
        {
          name: "Kabir Shah",
          bloodGroup: "B+",
          phone: "+12025550102",
          city: "Pune",
          area: "Kothrud",
          available: true,
        },
        {
          name: "Meera Nair",
          bloodGroup: "O+",
          phone: "+12025550103",
          city: "Pune",
          area: "Baner",
          available: true,
        },
        {
          name: "Arjun Patel",
          bloodGroup: "AB-",
          phone: "+12025550104",
          city: "Mumbai",
          area: "Dadar",
          available: false,
        },
      ];
      for (const donor of examples) {
        if (
          !response.data.data.some(
            (item) => item.phone.replace(/^\+/, "") === donor.phone.slice(1),
          )
        ) {
          await donorSvc.createDonor(donor);
        }
      }
      const requestResponse = await bloodRequestSvc.listAllRequests();
      if (
        !requestResponse.data.data.some(
          (item) =>
            item.message === "Fictional demo request. For testing only.",
        )
      ) {
        await bloodRequestSvc.createRequest({
          patientName: "Sample Patient",
          bloodGroup: "O+",
          city: "Pune",
          hospital: "Demo City Hospital",
          requesterName: "Sample Coordinator",
          phone: "+12025550105",
          units: 2,
          urgency: "urgent",
          message: "Fictional demo request. For testing only.",
        });
      }
      notify(
        "Fictional demo records added. You can edit or delete them in the directory.",
      );
    } catch (exception) {
      notify(exception.message, "error");
    } finally {
      refresh();
      demoLock.current = false;
      setDemoBusy(false);
    }
  };

  const available = donors.filter((donor) => donor.available).length;
  const openRequests = requests.filter(
    (request) => request.status === "open",
  ).length;
  return (
    <CommunityContext.Provider
      value={{
        donors,
        requests,
        loading,
        error,
        connected,
        revision,
        refresh,
        modal,
        openModal,
        closeModal,
        busy,
        formPending,
        setFormPending,
        feedback,
        saved,
        mutate,
        copy,
        findMatches,
        demoBusy,
        loadDemo,
        available,
        openRequests,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context)
    throw new Error("useCommunity must be used inside CommunityProvider.");
  return context;
};
