(function () {
  const allowedHosts = new Set(["google.com", "www.google.com", "photos.google.com"]);
  if (!allowedHosts.has(window.location.hostname)) {
    return;
  }

  if (document.getElementById("idm-fab")) {
    return;
  }

  const fab = document.createElement("button");
  fab.id = "idm-fab";
  fab.type = "button";
  fab.title = "Open date tools";
  fab.setAttribute("aria-label", "Open date tools");

  const fabIcon = document.createElement("img");
  fabIcon.src = chrome.runtime.getURL("src/images/icon48.png");
  fabIcon.alt = "Open date tools";
  fab.appendChild(fabIcon);

  const panel = document.createElement("div");
  panel.id = "idm-panel";
  panel.innerHTML = `
    <h4>Image Date Tools</h4>
    <button id="idm-run" type="button">Run action (label TBD)</button>
    <p>Opens a script to read fields and click Save.</p>
  `;

  fab.addEventListener("click", () => {
    panel.style.display = panel.style.display === "none" ? "block" : "none";
  });

  document.addEventListener("click", (event) => {
    if (!panel.contains(event.target) && event.target !== fab) {
      panel.style.display = "none";
    }
  });

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  const runButton = panel.querySelector("#idm-run");
  if (runButton) {
    runButton.addEventListener("click", () => {
      runFieldRead();
    });
  }

  function parseCapturedDateTimeFromFileName(fileName) {
    const buildResult = ({
      success,
      fileNameValue = null,
      year = null,
      month = null,
      date = null,
      hours = null,
      minutes = null,
      seconds = null,
      pattern = null,
      isDateOnly = null
    }) => ({
      result: success ? "Sucessfull" : "Not Sucessfull",
      fileName: fileNameValue,
      date,
      month,
      year,
      hours,
      minutes,
      seconds,
      pattern,
      isDateOnly
    });

    if (!fileName || typeof fileName !== "string") {
      return buildResult({ success: false });
    }

    const rawName = fileName.trim();
    if (!rawName) {
      return buildResult({ success: false });
    }

    const baseName = rawName
      .split(/[\\/]/)
      .pop()
      .replace(/\.[^.]+$/, "");

    const toInt = (value) => Number.parseInt(value, 10);

    const createDate = (year, month, day, hour = 0, minute = 0, second = 0) => {
      if (
        !Number.isInteger(year) ||
        !Number.isInteger(month) ||
        !Number.isInteger(day) ||
        !Number.isInteger(hour) ||
        !Number.isInteger(minute) ||
        !Number.isInteger(second)
      ) {
        return null;
      }

      if (
        year < 1970 ||
        year > 2100 ||
        month < 1 ||
        month > 12 ||
        day < 1 ||
        day > 31 ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59 ||
        second < 0 ||
        second > 59
      ) {
        return null;
      }

      const dateObj = new Date(year, month - 1, day, hour, minute, second);
      if (
        dateObj.getFullYear() !== year ||
        dateObj.getMonth() !== month - 1 ||
        dateObj.getDate() !== day ||
        dateObj.getHours() !== hour ||
        dateObj.getMinutes() !== minute ||
        dateObj.getSeconds() !== second
      ) {
        return null;
      }

      return dateObj;
    };

    const patterns = [
      {
        label: "IMG_yyyyMMdd_HHmmss",
        regex: /^IMG[_-](\d{8})[_-](\d{6})/i,
        extract: (match) => ({ date: match[1], time: match[2], dateOnly: false })
      },
      {
        label: "PXL_yyyyMMdd_HHmmss",
        regex: /^PXL[_-](\d{8})[_-](\d{6})/i,
        extract: (match) => ({ date: match[1], time: match[2], dateOnly: false })
      },
      {
        label: "VID_yyyyMMdd_HHmmss",
        regex: /^VID[_-](\d{8})[_-](\d{6})/i,
        extract: (match) => ({ date: match[1], time: match[2], dateOnly: false })
      },
      {
        label: "MVIMG_yyyyMMdd_HHmmss",
        regex: /^MVIMG[_-](\d{8})[_-](\d{6})/i,
        extract: (match) => ({ date: match[1], time: match[2], dateOnly: false })
      },
      {
        label: "Snapchat_YYYYMMDD_HHmmss",
        regex: /^Snapchat[_-](\d{8})[_-](\d{6})/i,
        extract: (match) => ({ date: match[1], time: match[2], dateOnly: false })
      },
      {
        label: "Instagram_IMG_YYYYMMDD_HHmmss",
        regex: /^Instagram_IMG[_-](\d{8})[_-](\d{6})/i,
        extract: (match) => ({ date: match[1], time: match[2], dateOnly: false })
      },
      {
        label: "FB_IMG_YYYYMMDD_HHmmss",
        regex: /^FB_IMG[_-](\d{8})[_-](\d{6})/i,
        extract: (match) => ({ date: match[1], time: match[2], dateOnly: false })
      },
      {
        label: "Screenshot_yyyyMMdd_HHmmss",
        regex: /^Screenshot[_-](\d{8})[_-](\d{6})/i,
        extract: (match) => ({ date: match[1], time: match[2], dateOnly: false })
      },
      {
        label: "BeautyPlus_yyyyMMddHHmmssSSS",
        regex: /^BeautyPlus[_-](\d{8})(\d{6})\d{0,3}/i,
        extract: (match) => ({ date: match[1], time: match[2], dateOnly: false })
      },
      {
        label: "B612_yyyyMMdd_HHmmss_SSS",
        regex: /^B612[_-](\d{8})[_-](\d{6})(?:[_-]\d{1,3})?/i,
        extract: (match) => ({ date: match[1], time: match[2], dateOnly: false })
      },
      {
        label: "Signal_yyyy-MM-dd-HH-mm-ss",
        regex: /^signal[-_](\d{4})-(\d{2})-(\d{2})[-_](\d{2})-(\d{2})-(\d{2})/i,
        extract: (match) => ({
          year: toInt(match[1]),
          month: toInt(match[2]),
          day: toInt(match[3]),
          hour: toInt(match[4]),
          minute: toInt(match[5]),
          second: toInt(match[6]),
          dateOnly: false
        })
      },
      {
        label: "WIN_yyyyMMdd_HH_mm_ss",
        regex: /^WIN[_-](\d{8})[_-](\d{2})[_-](\d{2})[_-](\d{2})/i,
        extract: (match) => ({ date: match[1], time: `${match[2]}${match[3]}${match[4]}`, dateOnly: false })
      },
      {
        label: "IMG-yyyyMMdd-WAxxxx",
        regex: /^IMG-(\d{8})-WA\d+/i,
        extract: (match) => ({ date: match[1], dateOnly: true })
      },
      {
        label: "VID-yyyyMMdd-WAxxxx",
        regex: /^VID-(\d{8})-WA\d+/i,
        extract: (match) => ({ date: match[1], dateOnly: true })
      },
      {
        label: "Generic_yyyyMMdd_HHmmss",
        regex: /(?:^|[_-])(\d{8})[_-](\d{6})(?:$|[_-])/,
        extract: (match) => ({ date: match[1], time: match[2], dateOnly: false })
      },
      {
        label: "Generic_yyyy-MM-dd_HH-mm-ss",
        regex: /(?:^|[_-])(\d{4})[-_](\d{2})[-_](\d{2})[T _-](\d{2})[-_.](\d{2})[-_.](\d{2})(?:$|[_-])/,
        extract: (match) => ({
          year: toInt(match[1]),
          month: toInt(match[2]),
          day: toInt(match[3]),
          hour: toInt(match[4]),
          minute: toInt(match[5]),
          second: toInt(match[6]),
          dateOnly: false
        })
      }
    ];

    const parseDateAndTime = (dateString, timeString) => {
      const year = toInt(dateString.slice(0, 4));
      const month = toInt(dateString.slice(4, 6));
      const day = toInt(dateString.slice(6, 8));
      const hour = timeString ? toInt(timeString.slice(0, 2)) : 0;
      const minute = timeString ? toInt(timeString.slice(2, 4)) : 0;
      const second = timeString ? toInt(timeString.slice(4, 6)) : 0;
      return { year, month, day, hour, minute, second };
    };

    for (const pattern of patterns) {
      const match = baseName.match(pattern.regex);
      if (!match) continue;

      const extracted = pattern.extract(match);
      if (!extracted) continue;

      let components = null;
      if (extracted.date) {
        components = parseDateAndTime(extracted.date, extracted.time);
      } else {
        components = {
          year: extracted.year,
          month: extracted.month,
          day: extracted.day,
          hour: extracted.hour ?? 0,
          minute: extracted.minute ?? 0,
          second: extracted.second ?? 0
        };
      }

      const capturedAt = createDate(
        components.year,
        components.month,
        components.day,
        components.hour,
        components.minute,
        components.second
      );

      if (!capturedAt) continue;

      const isDateOnly = Boolean(extracted.dateOnly);

      return buildResult({
        success: true,
        fileNameValue: baseName,
        year: components.year,
        month: components.month,
        date: components.day,
        hours: isDateOnly ? null : components.hour,
        minutes: isDateOnly ? null : components.minute,
        seconds: isDateOnly ? null : components.second,
        pattern: pattern.label,
        isDateOnly
      });
    }

    const millisCandidates = baseName.match(/\d{10,}/g);
    if (millisCandidates) {
      for (const candidate of millisCandidates) {
        const millis = Number.parseInt(candidate, 10);
        if (!Number.isFinite(millis)) continue;

        const millisDate = new Date(millis);
        if (Number.isNaN(millisDate.getTime())) continue;

        const year = millisDate.getFullYear();
        const month = millisDate.getMonth() + 1;
        const day = millisDate.getDate();
        const hour = millisDate.getHours();
        const minute = millisDate.getMinutes();
        const second = millisDate.getSeconds();

        if (
          year >= 1970 &&
          year <= 2100 &&
          month >= 1 &&
          month <= 12 &&
          day >= 1 &&
          day <= 31
        ) {
          return buildResult({
            success: true,
            fileNameValue: baseName,
            year,
            month,
            date: day,
            hours: hour,
            minutes: minute,
            seconds: second,
            pattern: "Millis_from_filename_fallback",
            isDateOnly: false
          });
        }
      }
    }

    return buildResult({
      success: false,
      fileNameValue: baseName
    });
  }

  function compareUploadedAndCaptured(uploadedText, parsedFromFileName) {
    const makeResult = ({
      canCompare,
      uploadedTextValue = null,
      uploadedDate = null,
      capturedDate = null,
      sameCalendarDate = null,
      sameDateTime = null,
      differenceMs = null
    }) => ({
      canCompare,
      uploadedText: uploadedTextValue,
      uploadedDate,
      capturedDate,
      sameCalendarDate,
      sameDateTime,
      differenceMs
    });

    if (!uploadedText || !parsedFromFileName || parsedFromFileName.result !== "Sucessfull") {
      return makeResult({ canCompare: false, uploadedTextValue: uploadedText || null });
    }

    const uploadedDate = new Date(uploadedText);
    if (Number.isNaN(uploadedDate.getTime())) {
      return makeResult({ canCompare: false, uploadedTextValue: uploadedText, uploadedDate: null });
    }

    if (
      parsedFromFileName.year == null ||
      parsedFromFileName.month == null ||
      parsedFromFileName.date == null
    ) {
      return makeResult({
        canCompare: false,
        uploadedTextValue: uploadedText,
        uploadedDate
      });
    }

    const hours = parsedFromFileName.hours ?? 0;
    const minutes = parsedFromFileName.minutes ?? 0;
    const seconds = parsedFromFileName.seconds ?? 0;

    const capturedDate = new Date(
      parsedFromFileName.year,
      parsedFromFileName.month - 1,
      parsedFromFileName.date,
      hours,
      minutes,
      seconds
    );

    if (Number.isNaN(capturedDate.getTime())) {
      return makeResult({
        canCompare: false,
        uploadedTextValue: uploadedText,
        uploadedDate
      });
    }

    const sameCalendarDate =
      uploadedDate.getFullYear() === capturedDate.getFullYear() &&
      uploadedDate.getMonth() === capturedDate.getMonth() &&
      uploadedDate.getDate() === capturedDate.getDate();

    const differenceMs = uploadedDate.getTime() - capturedDate.getTime();

    let sameDateTime = null;
    if (!parsedFromFileName.isDateOnly && parsedFromFileName.hours != null) {
      sameDateTime = differenceMs === 0;
    }

    return makeResult({
      canCompare: true,
      uploadedTextValue: uploadedText,
      uploadedDate,
      capturedDate,
      sameCalendarDate,
      sameDateTime,
      differenceMs
    });
  }

  function runFieldRead() {
    const isElementVisible = (el) => {
      if (!el || !(el instanceof Element)) return false;

      if (el.closest('[hidden], [aria-hidden="true"], [inert]')) {
        return false;
      }

      const style = window.getComputedStyle(el);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.visibility === "collapse" ||
        style.opacity === "0"
      ) {
        return false;
      }

      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const findField = (selectors) => {
      for (const selector of selectors) {
        const matches = Array.from(document.querySelectorAll(selector));
        const visibleMatch = matches.find((el) => isElementVisible(el));
        if (visibleMatch) return visibleMatch;

        const fallbackMatch = matches[matches.length - 1];
        if (fallbackMatch) return fallbackMatch;
      }
      return null;
    };

    const normalizeText = (value) => (value || "").trim();

    const extractValue = (el) => {
      if (!el) return null;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        return normalizeText(el.value);
      }
      const text = normalizeText(el.textContent);
      if (text) return text;
      return null;
    };

    const findValueByLabelText = (labels) => {
      const normalizedLabels = labels.map((label) => label.toLowerCase());
      const allCandidates = Array.from(
        document.querySelectorAll("label, [aria-label], [data-testid], [title], span, div")
      );
      const candidates = allCandidates.filter((el) => isElementVisible(el));

      for (const el of candidates) {
        const aria = el.getAttribute("aria-label");
        const title = el.getAttribute("title");
        const dataTest = el.getAttribute("data-testid");
        const text = normalizeText(aria || title || dataTest || el.textContent);
        if (!text) continue;

        const lowerText = text.toLowerCase();
        const matched = normalizedLabels.find((label) => lowerText.includes(label));
        if (!matched) continue;

        const directValue = extractValue(el);
        if (directValue && directValue.toLowerCase() !== matched) {
          return directValue.replace(new RegExp(`^${matched}\\s*:?\\s*`, "i"), "").trim();
        }

        const siblingValue = extractValue(el.nextElementSibling);
        if (siblingValue) return siblingValue;

        const parent = el.parentElement;
        if (parent) {
          const peer = Array.from(parent.children).find(
            (child) => child !== el && normalizeText(child.textContent)
          );
          const peerValue = extractValue(peer);
          if (peerValue) return peerValue;
        }
      }

      return null;
    };

    const fileNameEl = findField([
      '[aria-label^="Filename: "]',
      '[data-testid="file-name"]',
      '#file-name'
    ]);

    const dateEl = findField([
      '[aria-label^="Date taken"]',
      '[data-testid="date"]',
      '#date'
    ]);

    const fileName =
      extractValue(fileNameEl) ||
      findValueByLabelText(["file name", "filename", "name", "title"]);

    const updatedOrUploadedDate =
      extractValue(dateEl) ||
      findValueByLabelText([
        "uploaded",
        "updated",
        "last modified",
        "date",
        "taken"
      ]);

    const capturedDateFromFileName = parseCapturedDateTimeFromFileName(fileName);

    console.log("[Image Date Modifier] File name:", fileName || "Not found");
    console.log("[Image Date Modifier] Uploaded/Updated date:", updatedOrUploadedDate || "Not found");
    console.log("[Image Date Modifier] Captured date from filename:", capturedDateFromFileName);
    const comparison = compareUploadedAndCaptured(updatedOrUploadedDate, capturedDateFromFileName);
    console.log("[Image Date Modifier] Uploaded vs captured comparison:", comparison);
    

  }
})();
