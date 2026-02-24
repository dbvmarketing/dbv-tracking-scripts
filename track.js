/**
 * AdOps Studio — Conversion Tracking Script
 * Drop this on any landing page you control:
 * <script src="https://YOUR_PUBLISHED_DOMAIN/track.js" async defer></script>
 */
(function () {
  var BASE_URL = "https://lrcthbhsxdeicdugetle.supabase.co/functions/v1";

  function getParams() {
    var params = new URLSearchParams(window.location.search);
    // fbclid can also come from the URL hash or referrer in some cases
    var fbclid =
      params.get("fbclid") ||
      sessionStorage.getItem("_ao_fbclid") ||
      null;

    // Persist fbclid across pages in the same session
    if (fbclid) sessionStorage.setItem("_ao_fbclid", fbclid);

    // TikTok click ID
    var ttclid =
      params.get("ttclid") ||
      sessionStorage.getItem("_ao_ttclid") ||
      null;
    if (ttclid) sessionStorage.setItem("_ao_ttclid", ttclid);

    // Ad ID — persist across pages like fbclid
    var fb_adid =
      params.get("fb_adid") ||
      params.get("utm_content") ||
      sessionStorage.getItem("_ao_fb_adid") ||
      null;
    if (fb_adid) sessionStorage.setItem("_ao_fb_adid", fb_adid);

    return {
      fbclid: fbclid,
      ttclid: ttclid,
      fb_adid: fb_adid,
      utm_campaign: params.get("utm_campaign") || null,
      utm_term: params.get("utm_term") || null,
      utm_content: params.get("utm_content") || null,
      utm_source: params.get("utm_source") || null,
      utm_medium: params.get("utm_medium") || null,
      subid: params.get("subid") || null,
      subid2: params.get("subid2") || null,
      subid3: params.get("subid3") || null,
      ms_placement: params.get("ms_placement") || null,
      ms_publisher: params.get("ms_publisher") || null,
      utm_id: params.get("utm_id") || null,
    };
  }

  function send(endpoint, data) {
    var url = BASE_URL + "/" + endpoint;
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, JSON.stringify(data));
      } else {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          keepalive: true,
        });
      }
    } catch (e) {
      // Silently fail — never block the user experience
    }
  }

  // --- Fire page click event on load ---
  var params = getParams();
  var clickPayload = Object.assign({}, params, {
    landing_page_url: window.location.href,
    referrer: document.referrer || null,
  });

  // Store click_id returned by server for funnel event chaining
  var storedClickId = sessionStorage.getItem("_ao_click_id");

  if (!storedClickId) {
    fetch(BASE_URL + "/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clickPayload),
      keepalive: true,
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.click_id) {
          sessionStorage.setItem("_ao_click_id", data.click_id);
        }
      })
      .catch(function () {});
  }

  /**
   * Track a funnel step event.
   * Call this at each meaningful step:
   *
   *   window.aoTrack('form_step_1')
   *   window.aoTrack('form_step_2', { field: 'email' })
   *   window.aoTrack('lead_submitted', { form_id: 'quote-form' })
   *
   * Built-in event types: page_view, form_step_1–4, lead_submitted,
   *   lead_accepted, lead_rejected, cta_click
   * Custom events: prefix with "custom_" e.g. "custom_video_play"
   */
  window.aoTrack = function (eventType, eventData) {
    send("track-event", {
      event_type: eventType,
      fbclid: sessionStorage.getItem("_ao_fbclid") || null,
      ttclid: sessionStorage.getItem("_ao_ttclid") || null,
      click_event_id: sessionStorage.getItem("_ao_click_id") || null,
      landing_page_url: window.location.href,
      event_data: eventData || {},
    });
  };

  // Auto-fire page_view
  window.aoTrack("page_view");
})();
