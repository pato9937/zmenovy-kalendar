import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as Settings2, c as Check, i as Smartphone, l as CalendarRange, o as ChevronRight, r as Trash2, s as ChevronLeft, t as X, u as ArrowLeftRight } from "../_libs/lucide-react.mjs";
import { a as format, c as startOfMonth, d as differenceInCalendarDays, f as isWeekend, i as getDay, l as eachDayOfInterval, m as addDays, n as subDays, o as startOfYear, p as addMonths, r as isToday, s as endOfYear, t as sk, u as endOfMonth } from "../_libs/date-fns.mjs";
import { l as Slot } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as Drawer } from "../_libs/vaul.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B5YTQ9RA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium outline-none select-none touch-manipulation disabled:pointer-events-none disabled:opacity-40 transition-[transform,background-color,color,opacity] duration-150 ease-out active:not-disabled:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			ghost: "text-foreground hover:bg-surface-2",
			outline: "bg-transparent text-foreground shadow-border hover:bg-surface-2",
			subtle: "bg-surface-2 text-foreground hover:bg-surface-3",
			destructive: "bg-holiday/15 text-holiday hover:bg-holiday/25"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-sm",
			lg: "h-12 px-5",
			icon: "size-11",
			"icon-sm": "size-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
function toISODate(d) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function fromISODate(iso) {
	const [y, m, d] = iso.split("-").map(Number);
	return new Date(y, (m ?? 1) - 1, d ?? 1);
}
function todayISO() {
	return toISODate(/* @__PURE__ */ new Date());
}
function isOvernight(start, end) {
	return toMinutes(end) <= toMinutes(start);
}
function toMinutes(time) {
	const [h, m] = time.split(":").map(Number);
	return (h ?? 0) * 60 + (m ?? 0);
}
function durationHours(start, end) {
	let mins = toMinutes(end) - toMinutes(start);
	if (mins <= 0) mins += 1440;
	return Math.round(mins / 60 * 100) / 100;
}
function formatTime(time) {
	const [h, m] = time.split(":");
	return `${Number(h)}:${m ?? "00"}`;
}
function formatTimeShort(time) {
	const [h, m] = time.split(":");
	if (m && m !== "00") return `${Number(h)}:${m}`;
	return String(Number(h ?? "0"));
}
function formatRange(start, end, overnightNote = false) {
	if (!start || !end) return "";
	const range = `${formatTime(start)}–${formatTime(end)}`;
	if (overnightNote && isOvernight(start, end)) return `${range} nasledujúceho dňa`;
	return range;
}
function formatHours(n) {
	const rounded = Math.round(n * 10) / 10;
	return `${Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace(".", ",")} h`;
}
function formatDelta(n) {
	const rounded = Math.round(n * 10) / 10;
	const abs = Math.abs(rounded);
	const body = Number.isInteger(abs) ? String(abs) : abs.toFixed(1).replace(".", ",");
	if (rounded > 0) return `+${body} h`;
	if (rounded < 0) return `−${body} h`;
	return "0 h";
}
function formatMonthTitle(cursor) {
	return format(cursor, "LLLL yyyy", { locale: sk });
}
function formatDayLong(iso) {
	return format(fromISODate(iso), "EEEE d. MMMM yyyy", { locale: sk });
}
var WEEKDAYS = [
	"Po",
	"Ut",
	"St",
	"Št",
	"Pi",
	"So",
	"Ne"
];
var FIXED = [
	{
		m: 1,
		d: 1,
		name: "Deň vzniku Slovenskej republiky"
	},
	{
		m: 1,
		d: 6,
		name: "Traja králi"
	},
	{
		m: 5,
		d: 1,
		name: "Sviatok práce"
	},
	{
		m: 5,
		d: 8,
		name: "Deň víťazstva nad fašizmom"
	},
	{
		m: 7,
		d: 5,
		name: "Sviatok svätého Cyrila a Metoda"
	},
	{
		m: 8,
		d: 29,
		name: "Výročie SNP"
	},
	{
		m: 9,
		d: 1,
		name: "Deň Ústavy Slovenskej republiky"
	},
	{
		m: 9,
		d: 15,
		name: "Sedembolestná Panna Mária"
	},
	{
		m: 11,
		d: 1,
		name: "Sviatok všetkých svätých"
	},
	{
		m: 11,
		d: 17,
		name: "Deň boja za slobodu a demokraciu"
	},
	{
		m: 12,
		d: 24,
		name: "Štedrý deň"
	},
	{
		m: 12,
		d: 25,
		name: "Prvý sviatok vianočný"
	},
	{
		m: 12,
		d: 26,
		name: "Druhý sviatok vianočný"
	}
];
function easterSunday(year) {
	const a = year % 19;
	const b = Math.floor(year / 100);
	const c = year % 100;
	const d = Math.floor(b / 4);
	const e = b % 4;
	const f = Math.floor((b + 8) / 25);
	const g = Math.floor((b - f + 1) / 3);
	const h = (19 * a + b - d - g + 15) % 30;
	const i = Math.floor(c / 4);
	const k = c % 4;
	const l = (32 + 2 * e + 2 * i - h - k) % 7;
	const m = Math.floor((a + 11 * h + 22 * l) / 451);
	const month = Math.floor((h + l - 7 * m + 114) / 31);
	const day = (h + l - 7 * m + 114) % 31 + 1;
	return new Date(year, month - 1, day);
}
var cache = /* @__PURE__ */ new Map();
function holidaysForYear(year) {
	const hit = cache.get(year);
	if (hit) return hit;
	const map = /* @__PURE__ */ new Map();
	for (const h of FIXED) map.set(toISODate(new Date(year, h.m - 1, h.d)), { name: h.name });
	const easter = easterSunday(year);
	map.set(toISODate(subDays(easter, 2)), { name: "Veľký piatok" });
	map.set(toISODate(addDays(easter, 1)), { name: "Veľkonočný pondelok" });
	cache.set(year, map);
	return map;
}
function getHoliday(iso) {
	const year = Number(iso.slice(0, 4));
	if (!Number.isFinite(year)) return null;
	return holidaysForYear(year).get(iso) ?? null;
}
function isPublicHoliday(iso) {
	return getHoliday(iso) !== null;
}
function CalendarMonth({ cursor, days, selected, moveSource, onSelect, onSwipeMonth, onSwap, onMoveStart }) {
	const touch = (0, import_react.useRef)(null);
	const ignoreSwipe = (0, import_react.useRef)(false);
	const [overIso, setOverIso] = (0, import_react.useState)(null);
	const [finePointer, setFinePointer] = (0, import_react.useState)(false);
	const cells = (0, import_react.useMemo)(() => buildCells(cursor), [cursor]);
	(0, import_react.useEffect)(() => {
		setFinePointer(window.matchMedia("(pointer: fine)").matches);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-2xl bg-card p-3 shadow-border sm:p-4",
		onTouchStart: (e) => {
			const t = e.changedTouches[0];
			if (!t) return;
			ignoreSwipe.current = false;
			touch.current = {
				x: t.clientX,
				y: t.clientY
			};
		},
		onTouchEnd: (e) => {
			const start = touch.current;
			const t = e.changedTouches[0];
			touch.current = null;
			if (ignoreSwipe.current || !start || !t) return;
			const dx = t.clientX - start.x;
			const dy = t.clientY - start.y;
			if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy)) return;
			onSwipeMonth(dx < 0 ? 1 : -1);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-7 gap-1",
			children: [WEEKDAYS.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("pb-2 text-center text-2xs font-medium uppercase tracking-wider", i >= 5 ? "text-subtle" : "text-muted-foreground"),
				children: d
			}, d)), cells.map((cell, i) => {
				if (!cell) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-16" }, `empty-${i}`);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayCell, {
					iso: cell.iso,
					date: cell.date,
					shift: days[cell.iso],
					selected: selected === cell.iso,
					moveSource: moveSource === cell.iso,
					moveTarget: Boolean(moveSource) && moveSource !== cell.iso,
					dropTarget: overIso === cell.iso,
					draggable: finePointer,
					onSelect,
					onSwap,
					onMoveStart: (iso) => {
						ignoreSwipe.current = true;
						onMoveStart(iso);
					},
					onDragActive: (active, over) => {
						ignoreSwipe.current = active;
						setOverIso(over);
					}
				}, cell.iso);
			})]
		})
	});
}
function buildCells(cursor) {
	const start = startOfMonth(cursor);
	const end = endOfMonth(cursor);
	const leading = (getDay(start) + 6) % 7;
	const monthDays = eachDayOfInterval({
		start,
		end
	});
	const cells = [];
	for (let i = 0; i < leading; i += 1) cells.push(null);
	for (const date of monthDays) cells.push({
		iso: toISODate(date),
		date
	});
	const trailing = (7 - cells.length % 7) % 7;
	for (let i = 0; i < trailing; i += 1) cells.push(null);
	return cells;
}
function DayCell({ iso, date, shift, selected, moveSource, moveTarget, dropTarget, draggable, onSelect, onSwap, onMoveStart, onDragActive }) {
	const holiday = getHoliday(iso);
	const weekend = isWeekend(date);
	const kind = shift?.kind ?? "off";
	const today = isToday(date);
	const press = (0, import_react.useRef)(null);
	const skipClick = (0, import_react.useRef)(false);
	function clearPress() {
		if (press.current) {
			window.clearTimeout(press.current.id);
			press.current = null;
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		draggable,
		onClick: () => {
			if (skipClick.current) {
				skipClick.current = false;
				return;
			}
			onSelect(iso);
		},
		onPointerDown: (e) => {
			if (e.pointerType === "mouse") return;
			clearPress();
			press.current = {
				x: e.clientX,
				y: e.clientY,
				id: window.setTimeout(() => {
					press.current = null;
					skipClick.current = true;
					if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(12);
					onMoveStart(iso);
				}, 420)
			};
		},
		onPointerMove: (e) => {
			if (!press.current) return;
			if (Math.hypot(e.clientX - press.current.x, e.clientY - press.current.y) > 12) clearPress();
		},
		onPointerUp: clearPress,
		onPointerCancel: clearPress,
		onDragStart: (e) => {
			e.dataTransfer.setData("text/plain", iso);
			e.dataTransfer.effectAllowed = "move";
			onDragActive(true, null);
		},
		onDragEnd: () => onDragActive(false, null),
		onDragOver: (e) => {
			e.preventDefault();
			e.dataTransfer.dropEffect = "move";
			onDragActive(true, iso);
		},
		onDrop: (e) => {
			e.preventDefault();
			const from = e.dataTransfer.getData("text/plain");
			onDragActive(false, null);
			if (from && from !== iso) onSwap(from, iso);
		},
		"aria-label": iso,
		className: cn("relative flex h-16 flex-col items-start overflow-hidden rounded-lg p-1.5 text-left outline-none touch-manipulation", "transition-[transform,background-color,box-shadow] duration-150 ease-out", "focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]", cellTone(kind, Boolean(holiday), weekend), today && "ring-1 ring-foreground/50", selected && "ring-2 ring-foreground", moveSource && "ring-2 ring-morning", (moveTarget || dropTarget) && "outline-dashed outline-1 outline-foreground/35"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex w-full items-start justify-between gap-0.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("text-xs font-semibold tabular-nums leading-none", holiday ? "text-holiday" : kind === "off" && !weekend ? "text-off-fg" : weekend || kind === "off" ? "text-muted-foreground" : "text-inherit"),
					children: date.getDate()
				}), shift?.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-0.5 size-1 shrink-0 rounded-full bg-current opacity-70" }) : null]
			}),
			kind !== "off" && shift ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "mt-auto w-full truncate whitespace-nowrap text-2xs font-medium tabular-nums leading-tight",
				children: [
					formatTimeShort(shift.start),
					"–",
					formatTimeShort(shift.end),
					shift.end && shift.start && shift.end <= shift.start ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "opacity-70",
						children: "+1"
					}) : null
				]
			}) : holiday ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-auto truncate text-2xs leading-tight text-holiday/90",
				children: "sviatok"
			}) : null,
			holiday && kind !== "off" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute right-1 top-1 size-1.5 rounded-full bg-holiday" }) : null
		]
	});
}
function cellTone(kind, holiday, weekend) {
	if (holiday) return "bg-holiday-dim text-holiday";
	if (kind === "morning") return "bg-morning-dim text-morning";
	if (kind === "night") return "bg-night-dim text-night";
	if (kind === "shift8") return "bg-shift8-dim text-shift8";
	if (kind === "extra") return "bg-extra-dim text-extra";
	if (weekend) return "bg-weekend text-subtle";
	return "bg-off-dim text-off-fg";
}
function Drawer$1({ open, onOpenChange, children, title, description }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Root, {
		open,
		onOpenChange,
		shouldScaleBackground: false,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Drawer.Portal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Overlay, { className: "fixed inset-0 z-50 bg-background/70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Drawer.Content, {
			className: cn("fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] w-full max-w-lg flex-col", "rounded-t-3xl bg-card pb-[max(1rem,env(safe-area-inset-bottom))] shadow-border", "outline-none"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-border-strong" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Title, {
					className: "px-5 pt-4 text-lg font-semibold tracking-tight text-foreground text-balance",
					children: title
				}),
				description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Description, {
					className: "px-5 pt-1 text-sm text-muted-foreground text-pretty",
					children: description
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Description, {
					className: "sr-only",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 min-h-0 overflow-y-auto px-5 pb-2",
					children
				})
			]
		})] })
	});
}
var DEFAULT_TIMES = {
	morningStart: "06:00",
	morningEnd: "18:00",
	nightStart: "18:00",
	nightEnd: "06:00",
	shift8Start: "06:00",
	shift8End: "14:00"
};
var KIND_LABEL = {
	morning: "Ranná",
	night: "Nočná",
	shift8: "8-hodinová",
	extra: "Navyše",
	off: "Voľno"
};
var ROT12 = [
	"morning",
	"morning",
	"night",
	"night",
	"off",
	"off",
	"off",
	"off"
];
function rotationEndISO(start) {
	return toISODate(addDays(addMonths(fromISODate(start), 24), -1));
}
function makeShift(kind, times, manual, note = "") {
	if (kind === "off") return {
		kind,
		start: "",
		end: "",
		hours: 0,
		note,
		manual
	};
	const { start, end } = timesForKind(kind, times);
	return {
		kind,
		start,
		end,
		hours: durationHours(start, end),
		note,
		manual
	};
}
function timesForKind(kind, times) {
	if (kind === "morning") return {
		start: times.morningStart,
		end: times.morningEnd
	};
	if (kind === "night") return {
		start: times.nightStart,
		end: times.nightEnd
	};
	if (kind === "shift8") return {
		start: times.shift8Start,
		end: times.shift8End
	};
	return {
		start: times.morningStart,
		end: times.morningEnd
	};
}
function generateRotation(opts) {
	const origin = fromISODate(opts.start);
	const end = addDays(addMonths(origin, 24), -1);
	const interval = eachDayOfInterval({
		start: origin,
		end
	});
	const next = { ...opts.existing };
	for (const date of interval) {
		const iso = toISODate(date);
		const prev = opts.existing[iso];
		if (prev?.manual && !opts.overwriteManual) continue;
		let kind = "off";
		if (opts.type === "rot12") kind = ROT12[(differenceInCalendarDays(date, origin) % 8 + 8) % 8] ?? "off";
		else {
			const dow = getDay(date);
			kind = dow === 0 || dow === 6 ? "off" : "shift8";
		}
		next[iso] = makeShift(kind, opts.times, false, prev?.note ?? "");
	}
	return next;
}
function computeStats(opts) {
	const start = fromISODate(opts.from);
	const end = fromISODate(opts.to);
	const gate = opts.patternStart ? fromISODate(opts.patternStart) : start;
	const stats = {
		workedHours: 0,
		standardHours: 0,
		delta: 0,
		morningCount: 0,
		nightCount: 0,
		shift8Count: 0,
		extraCount: 0,
		offCount: 0,
		workDays: 0
	};
	for (const date of eachDayOfInterval({
		start,
		end
	})) {
		if (date < gate) continue;
		const iso = toISODate(date);
		const shift = opts.days[iso];
		const kind = shift?.kind ?? "off";
		const hours = kind === "off" ? 0 : shift?.hours ?? 0;
		stats.workedHours += hours;
		if (kind !== "off") stats.workDays += 1;
		if (kind === "morning") stats.morningCount += 1;
		else if (kind === "night") stats.nightCount += 1;
		else if (kind === "shift8") stats.shift8Count += 1;
		else if (kind === "extra") stats.extraCount += 1;
		else stats.offCount += 1;
		if (!isWeekend(date) && !isPublicHoliday(iso)) stats.standardHours += opts.standardDailyHours;
	}
	stats.workedHours = Math.round(stats.workedHours * 10) / 10;
	stats.standardHours = Math.round(stats.standardHours * 10) / 10;
	stats.delta = Math.round((stats.workedHours - stats.standardHours) * 10) / 10;
	return stats;
}
function nextWorkDay(days, fromISO) {
	const start = fromISODate(fromISO);
	for (let i = 0; i < 60; i += 1) {
		const iso = toISODate(addDays(start, i));
		const shift = days[iso];
		if (shift && shift.kind !== "off") return {
			iso,
			shift
		};
	}
	return null;
}
function swapShifts(days, a, b) {
	const left = days[a] ?? makeShift("off", DEFAULT_TIMES, true);
	const right = days[b] ?? makeShift("off", DEFAULT_TIMES, true);
	return {
		...days,
		[a]: {
			...right,
			manual: true
		},
		[b]: {
			...left,
			manual: true
		}
	};
}
var INITIAL = {
	setupDone: false,
	pattern: null,
	patternStart: null,
	standardDailyHours: 7.5,
	days: {},
	...DEFAULT_TIMES
};
var useShiftStore = create()(persist((set, get) => ({
	hasHydrated: false,
	...INITIAL,
	generate: ({ type, start, overwriteManual, times }) => {
		const state = get();
		const nextTimes = {
			...pickTimes(state),
			...times
		};
		const days = generateRotation({
			type,
			start,
			times: nextTimes,
			existing: state.days,
			overwriteManual
		});
		set({
			...nextTimes,
			days,
			pattern: type,
			patternStart: start,
			setupDone: true
		});
	},
	setKind: (iso, kind) => {
		const state = get();
		const prev = state.days[iso];
		const next = makeShift(kind, pickTimes(state), true, prev?.note ?? "");
		set({ days: {
			...state.days,
			[iso]: next
		} });
	},
	updateDay: (iso, patch) => {
		const state = get();
		const merged = {
			...state.days[iso] ?? makeShift("off", pickTimes(state), true),
			...patch,
			manual: true
		};
		if (patch.start !== void 0 || patch.end !== void 0) {
			if (merged.start && merged.end) merged.hours = durationHours(merged.start, merged.end);
		}
		set({ days: {
			...state.days,
			[iso]: merged
		} });
	},
	swap: (a, b) => {
		if (a === b) return;
		set({ days: swapShifts(get().days, a, b) });
	},
	setStandardHours: (hours) => set({ standardDailyHours: hours }),
	setTimes: (times, applyToGenerated) => {
		const state = get();
		const nextTimes = {
			...pickTimes(state),
			...times
		};
		if (!applyToGenerated) {
			set(nextTimes);
			return;
		}
		const days = { ...state.days };
		for (const [iso, shift] of Object.entries(days)) {
			if (shift.manual || shift.kind === "off" || shift.kind === "extra") continue;
			days[iso] = makeShift(shift.kind, nextTimes, false, shift.note);
		}
		set({
			...nextTimes,
			days
		});
	},
	reset: () => set({
		...INITIAL,
		hasHydrated: true
	})
}), {
	name: "zmeny-v1",
	skipHydration: true,
	onRehydrateStorage: () => () => {
		useShiftStore.setState({ hasHydrated: true });
	},
	partialize: (s) => ({
		setupDone: s.setupDone,
		pattern: s.pattern,
		patternStart: s.patternStart,
		standardDailyHours: s.standardDailyHours,
		days: s.days,
		morningStart: s.morningStart,
		morningEnd: s.morningEnd,
		nightStart: s.nightStart,
		nightEnd: s.nightEnd,
		shift8Start: s.shift8Start,
		shift8End: s.shift8End
	})
}));
function pickTimes(state) {
	return {
		morningStart: state.morningStart,
		morningEnd: state.morningEnd,
		nightStart: state.nightStart,
		nightEnd: state.nightEnd,
		shift8Start: state.shift8Start,
		shift8End: state.shift8End
	};
}
var KINDS = [
	"morning",
	"night",
	"shift8",
	"extra",
	"off"
];
function DayEditor({ iso, onClose, onMove }) {
	const days = useShiftStore((s) => s.days);
	const setKind = useShiftStore((s) => s.setKind);
	const updateDay = useShiftStore((s) => s.updateDay);
	const morningStart = useShiftStore((s) => s.morningStart);
	const morningEnd = useShiftStore((s) => s.morningEnd);
	const nightStart = useShiftStore((s) => s.nightStart);
	const nightEnd = useShiftStore((s) => s.nightEnd);
	const shift8Start = useShiftStore((s) => s.shift8Start);
	const shift8End = useShiftStore((s) => s.shift8End);
	const shift = iso ? days[iso] : void 0;
	const holiday = iso ? getHoliday(iso) : null;
	const kind = shift?.kind ?? "off";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer$1, {
		open: Boolean(iso),
		onOpenChange: (open) => {
			if (!open) onClose();
		},
		title: iso ? formatDayLong(iso) : "Deň",
		description: holiday ? holiday.name : kind !== "off" && shift ? formatRange(shift.start, shift.end, true) : "Voľný deň",
		children: iso ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5 pb-2",
			children: [
				holiday ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "rounded-xl bg-holiday-dim px-3 py-2 text-sm text-holiday",
					children: ["Štátny sviatok — ", holiday.name]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground",
					children: "Typ zmeny"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-2",
					children: KINDS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setKind(iso, k),
						className: cn("h-11 rounded-xl px-3 text-sm font-medium shadow-border transition-[transform,background-color] duration-150 ease-out active:scale-[0.97]", k === "off" && "col-span-2", kind === k ? chipActive(k) : "bg-surface-2 text-muted-foreground"),
						children: KIND_LABEL[k]
					}, k))
				})] }),
				kind !== "off" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-medium text-muted-foreground",
								children: "Od"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "time",
								value: shift?.start || defaultStart(kind, {
									morningStart,
									nightStart,
									shift8Start
								}),
								onChange: (e) => updateDay(iso, {
									start: e.target.value,
									kind
								}),
								className: "mt-1 h-11 w-full rounded-xl bg-surface-2 px-3 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs font-medium text-muted-foreground",
								children: ["Do ", shift && isOvernight(shift.start || "18:00", shift.end || "06:00") ? "(ďalší deň)" : ""]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "time",
								value: shift?.end || defaultEnd(kind, {
									morningEnd,
									nightEnd,
									shift8End
								}),
								onChange: (e) => updateDay(iso, {
									end: e.target.value,
									kind
								}),
								className: "mt-1 h-11 w-full rounded-xl bg-surface-2 px-3 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "col-span-2 text-sm text-muted-foreground",
							children: [
								"Dĺžka",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums text-foreground",
									children: formatHours(shift?.hours ?? 0)
								}),
								shift?.manual ? " · upravené ručne" : null
							]
						})
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-medium text-muted-foreground",
						children: "Poznámka"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						value: shift?.note ?? "",
						placeholder: "Napr. záskok, nadčas…",
						onChange: (e) => updateDay(iso, {
							note: e.target.value,
							kind
						}),
						className: "mt-1 h-11 w-full rounded-xl bg-surface-2 px-3 text-base text-foreground outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "subtle",
						className: "flex-1",
						onClick: () => {
							onMove(iso);
							onClose();
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeftRight, { className: "size-4" }), "Presunúť"]
					}), kind !== "off" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "destructive",
						className: "flex-1",
						onClick: () => setKind(iso, "off"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), "Zmazať"]
					}) : null]
				})
			]
		}) : null
	});
}
function chipActive(kind) {
	if (kind === "morning") return "bg-morning-dim text-morning";
	if (kind === "night") return "bg-night-dim text-night";
	if (kind === "shift8") return "bg-shift8-dim text-shift8";
	if (kind === "extra") return "bg-extra-dim text-extra";
	return "bg-off-dim text-off-fg";
}
function defaultStart(kind, times) {
	if (kind === "night") return times.nightStart;
	if (kind === "shift8") return times.shift8Start;
	return times.morningStart;
}
function defaultEnd(kind, times) {
	if (kind === "night") return times.nightEnd;
	if (kind === "shift8") return times.shift8End;
	return times.morningEnd;
}
var KEY = "zmeny-install-hint";
function InstallHint() {
	const [visible, setVisible] = (0, import_react.useState)(false);
	const [howto, setHowto] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const standalone = window.matchMedia("(display-mode: standalone)").matches || Boolean(window.navigator.standalone);
		setVisible(!standalone && localStorage.getItem(KEY) !== "1");
	}, []);
	if (!visible) return null;
	function dismiss() {
		localStorage.setItem(KEY, "1");
		setVisible(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start gap-3 rounded-2xl bg-card p-3 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-morning",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-foreground",
						children: "Pridať na plochu iPhonu"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-xs leading-relaxed text-muted-foreground",
						children: "Otvor v Safari a ulož ako appku. Dáta ostanú len v telefóne."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setHowto(true),
						className: "mt-2 text-sm font-medium text-morning",
						children: "Ako na to"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Zavrieť",
				onClick: dismiss,
				className: "flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Drawer$1, {
		open: howto,
		onOpenChange: setHowto,
		title: "Pridať na plochu",
		description: "Na iPhone to funguje ako samostatná appka, bez App Store.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
			className: "list-decimal space-y-3 pb-4 pl-5 text-sm leading-relaxed text-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Otvor túto stránku v Safari (nie v Chrome)." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Ťukni na ikonu Zdieľať (štvorček so šípkou hore)." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Zvoľ „Pridať na plochu“ a potvrď." })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "w-full",
			onClick: () => {
				setHowto(false);
				dismiss();
			},
			children: "Rozumiem"
		})]
	})] });
}
function LogoMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className,
		"aria-hidden": "true",
		fill: "none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "32",
				height: "32",
				rx: "7",
				fill: "#09090B"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "5",
				y: "7",
				width: "22",
				height: "20",
				rx: "4",
				fill: "#18181B"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "5",
				y: "7",
				width: "22",
				height: "6",
				rx: "4",
				fill: "#5B8DEF"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "5",
				y: "10",
				width: "22",
				height: "3",
				fill: "#5B8DEF"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "10",
				y: "4.5",
				width: "2.6",
				height: "6.2",
				rx: "1.3",
				fill: "#D4D4D8"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "19.4",
				y: "4.5",
				width: "2.6",
				height: "6.2",
				rx: "1.3",
				fill: "#D4D4D8"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "8",
				y: "15.4",
				width: "6.6",
				height: "4.4",
				rx: "1.1",
				fill: "#5B8DEF"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "17.4",
				y: "15.4",
				width: "6.6",
				height: "4.4",
				rx: "1.1",
				fill: "#5B8DEF"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "8",
				y: "21.2",
				width: "6.6",
				height: "4.4",
				rx: "1.1",
				fill: "#3DCF8E"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "17.4",
				y: "21.2",
				width: "6.6",
				height: "4.4",
				rx: "1.1",
				fill: "#3DCF8E"
			})
		]
	});
}
function SettingsPanel({ open, onOpenChange, onNewRotation }) {
	const standardDailyHours = useShiftStore((s) => s.standardDailyHours);
	const setStandardHours = useShiftStore((s) => s.setStandardHours);
	const setTimes = useShiftStore((s) => s.setTimes);
	const reset = useShiftStore((s) => s.reset);
	const morningStart = useShiftStore((s) => s.morningStart);
	const morningEnd = useShiftStore((s) => s.morningEnd);
	const nightStart = useShiftStore((s) => s.nightStart);
	const nightEnd = useShiftStore((s) => s.nightEnd);
	const shift8Start = useShiftStore((s) => s.shift8Start);
	const shift8End = useShiftStore((s) => s.shift8End);
	const [confirmReset, setConfirmReset] = (0, import_react.useState)(false);
	const standalone = typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || "standalone" in window.navigator && Boolean(window.navigator.standalone));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer$1, {
		open,
		onOpenChange: (v) => {
			setConfirmReset(false);
			onOpenChange(v);
		},
		title: "Nastavenia",
		description: "Fond, časy a rotácia. Dáta ostávajú len v tomto telefóne.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6 pb-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground",
					children: "Denný fond"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [7.5, 8].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setStandardHours(h),
						className: standardDailyHours === h ? "h-11 rounded-xl bg-surface-3 text-sm font-medium text-foreground" : "h-11 rounded-xl bg-surface-2 text-sm text-muted-foreground",
						children: h === 7.5 ? "7,5 h" : "8 h"
					}, h))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground",
							children: "Časy zmien"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimeRow, {
							label: "Ranná",
							start: morningStart,
							end: morningEnd,
							onChange: (start, end) => setTimes({
								morningStart: start,
								morningEnd: end
							}, true)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimeRow, {
							label: "Nočná",
							start: nightStart,
							end: nightEnd,
							overnight: true,
							onChange: (start, end) => setTimes({
								nightStart: start,
								nightEnd: end
							}, true)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimeRow, {
							label: "8-hodinová",
							start: shift8Start,
							end: shift8End,
							onChange: (start, end) => setTimes({
								shift8Start: start,
								shift8End: end
							}, true)
						})
					]
				}),
				!standalone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-xl bg-surface-2 p-3 text-sm leading-relaxed text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium text-foreground",
						children: "Pridať na plochu iPhonu"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "mt-2 list-decimal space-y-1 pl-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Otvor appku v Safari" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Ťukni na Zdieľať" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Pridať na plochu" })
						]
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "subtle",
						onClick: () => {
							onOpenChange(false);
							onNewRotation();
						},
						children: "Nová rotácia"
					}), confirmReset ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "destructive",
						onClick: () => {
							reset();
							setConfirmReset(false);
							onOpenChange(false);
						},
						children: "Naozaj vymazať všetko"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => setConfirmReset(true),
						children: "Vymazať kalendár"
					})]
				})
			]
		})
	});
}
function TimeRow({ label, start, end, overnight, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-24 shrink-0 text-sm text-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "time",
				value: start,
				onChange: (e) => onChange(e.target.value, end),
				className: "h-10 flex-1 rounded-lg bg-surface-2 px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-subtle",
				children: "–"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "time",
				value: end,
				onChange: (e) => onChange(start, e.target.value),
				className: "h-10 flex-1 rounded-lg bg-surface-2 px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
			}),
			overnight ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-8 text-2xs text-muted-foreground",
				children: "+1"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-8" })
		]
	});
}
var PATTERN = [
	{
		kind: "morning",
		label: "R"
	},
	{
		kind: "morning",
		label: "R"
	},
	{
		kind: "night",
		label: "N"
	},
	{
		kind: "night",
		label: "N"
	},
	{
		kind: "off",
		label: "V"
	},
	{
		kind: "off",
		label: "V"
	},
	{
		kind: "off",
		label: "V"
	},
	{
		kind: "off",
		label: "V"
	}
];
function SetupWizard({ mode, onClose }) {
	const generate = useShiftStore((s) => s.generate);
	const existingPattern = useShiftStore((s) => s.pattern);
	const existingStart = useShiftStore((s) => s.patternStart);
	const [type, setType] = (0, import_react.useState)(existingPattern ?? "rot12");
	const [start, setStart] = (0, import_react.useState)(existingStart ?? todayISO());
	const [keepManual, setKeepManual] = (0, import_react.useState)(true);
	const previewLabel = (0, import_react.useMemo)(() => {
		if (type === "rot12") return "2 ranné · 2 nočné · 4 voľno — opakuje sa 2 roky";
		return "Pondelok–piatok 8 h, víkendy voľno — 2 roky";
	}, [type]);
	function submit() {
		generate({
			type,
			start,
			overwriteManual: mode === "first" ? true : !keepManual
		});
		onClose?.();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-10 pt-[max(1.5rem,env(safe-area-inset-top))]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMark, { className: "size-10 rounded-xl shadow-border" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground",
					children: "Kalendár zmien"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "Zmeny"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-3xl font-semibold tracking-tight text-balance",
					children: mode === "first" ? "Ako máš zmeny?" : "Nová rotácia"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty",
					children: "Vyber začiatok prvej rannej a rotácia sa vykreslí na dva roky. Každý deň potom vieš zmeniť, posunúť, zmazať alebo doplniť navyše."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setType("rot12"),
					className: cn("rounded-2xl p-4 text-left shadow-border transition-[transform,background-color] duration-150 ease-out active:scale-[0.98]", type === "rot12" ? "bg-surface-2" : "bg-card"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium text-foreground",
							children: "12-hodinová rotácia"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: [
								KIND_LABEL.morning,
								" 6:00–18:00, ",
								KIND_LABEL.night,
								" 18:00–6:00 nasledujúceho dňa"
							]
						})] }), type === "rot12" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
							className: "size-5 text-morning",
							strokeWidth: 2.2
						}) : null]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex gap-1",
						children: PATTERN.map((cell, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("flex h-8 flex-1 items-center justify-center rounded-md text-2xs font-semibold", cell.kind === "morning" && "bg-morning-dim text-morning", cell.kind === "night" && "bg-night-dim text-night", cell.kind === "off" && "bg-off-dim text-off-fg"),
							children: cell.label
						}, `${cell.kind}-${i}`))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setType("week8"),
					className: cn("rounded-2xl p-4 text-left shadow-border transition-[transform,background-color] duration-150 ease-out active:scale-[0.98]", type === "week8" ? "bg-surface-2" : "bg-card"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium text-foreground",
							children: "Týždenné 8-hodinové"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "Klasický fond Po–Pia, predvolene 6:00–14:00"
						})] }), type === "week8" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
							className: "size-5 text-shift8",
							strokeWidth: 2.2
						}) : null]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex gap-1",
						children: [
							"8",
							"8",
							"8",
							"8",
							"8",
							"V",
							"V"
						].map((label, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("flex h-8 flex-1 items-center justify-center rounded-md text-2xs font-semibold", label === "8" ? "bg-shift8-dim text-shift8" : "bg-off-dim text-off-fg"),
							children: label
						}, `${label}-${i}`))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-8 block",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-medium text-foreground",
						children: type === "rot12" ? "Dátum prvej rannej" : "Od ktorého dňa začínaš"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "date",
						value: start,
						onChange: (e) => setStart(e.target.value),
						className: "mt-2 h-12 w-full rounded-xl bg-card px-3 text-base text-foreground shadow-border outline-none focus-visible:ring-2 focus-visible:ring-ring"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-2 block text-sm text-muted-foreground",
						children: start ? formatDayLong(start) : "Vyber dátum"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted-foreground",
				children: previewLabel
			}),
			mode === "regen" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-5 flex items-center gap-3 text-sm text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: keepManual,
					onChange: (e) => setKeepManual(e.target.checked),
					className: "size-4 accent-morning"
				}), "Ponechať ručné úpravy"]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-auto flex flex-col gap-2 pt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "lg",
					className: "w-full",
					onClick: submit,
					disabled: !start,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarRange, { className: "size-4" }), "Vygenerovať 2 roky"]
				}), mode === "regen" && onClose ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					className: "w-full",
					onClick: onClose,
					children: "Zrušiť"
				}) : null]
			})
		]
	});
}
function StatsBar({ cursor }) {
	const days = useShiftStore((s) => s.days);
	const standardDailyHours = useShiftStore((s) => s.standardDailyHours);
	const patternStart = useShiftStore((s) => s.patternStart);
	const [range, setRange] = (0, import_react.useState)("month");
	const bounds = rangeBounds(range, cursor, patternStart);
	const stats = computeStats({
		days,
		from: bounds.from,
		to: bounds.to,
		standardDailyHours,
		patternStart
	});
	const upcoming = nextWorkDay(days, todayISO());
	const plus = stats.delta > 0;
	const minus = stats.delta < 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl bg-card px-4 py-3 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground",
						children: ["Saldo · ", bounds.label]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("text-2xl font-semibold tracking-tight tabular-nums", plus && "text-night", minus && "text-holiday", !plus && !minus && "text-foreground"),
						children: formatDelta(stats.delta)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"Odpracované",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums text-foreground",
							children: formatHours(stats.workedHours)
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"Fond",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums text-foreground",
							children: formatHours(stats.standardHours)
						})
					] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "inline-flex rounded-full bg-surface-2 p-0.5",
					children: [
						["month", "Mesiac"],
						["year", String(cursor.getFullYear())],
						["all", "Rotácia"]
					].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setRange(id),
						className: cn("h-8 rounded-full px-2.5 text-xs font-medium", range === id ? "bg-card text-foreground" : "text-muted-foreground"),
						children: label
					}, id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-2xs text-muted-foreground",
					children: [
						stats.morningCount ? `${stats.morningCount}× R` : null,
						stats.morningCount && stats.nightCount ? " · " : null,
						stats.nightCount ? `${stats.nightCount}× N` : null,
						stats.shift8Count ? `${stats.morningCount || stats.nightCount ? " · " : ""}${stats.shift8Count}× 8 h` : null,
						stats.extraCount ? ` · ${stats.extraCount}× +` : null
					]
				})]
			}),
			upcoming ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 border-t border-border pt-2 text-sm text-foreground",
				children: [
					upcoming.iso === todayISO() ? "Dnes" : upcoming.iso === toISODate(addDays(/* @__PURE__ */ new Date(), 1)) ? "Zajtra" : format(fromISODate(upcoming.iso), "EEEE d. M.", { locale: sk }),
					" · ",
					KIND_LABEL[upcoming.shift.kind],
					" ",
					formatRange(upcoming.shift.start, upcoming.shift.end, true)
				]
			}) : null
		]
	});
}
function rangeBounds(range, cursor, patternStart) {
	if (range === "year") return {
		from: toISODate(startOfYear(cursor)),
		to: toISODate(endOfYear(cursor)),
		label: String(cursor.getFullYear())
	};
	if (range === "all" && patternStart) return {
		from: patternStart,
		to: rotationEndISO(patternStart),
		label: "2 roky"
	};
	return {
		from: toISODate(startOfMonth(cursor)),
		to: toISODate(endOfMonth(cursor)),
		label: format(cursor, "LLLL", { locale: sk })
	};
}
function UpcomingStrip({ onSelect }) {
	const days = useShiftStore((s) => s.days);
	const items = Array.from({ length: 8 }, (_, i) => {
		const date = addDays(/* @__PURE__ */ new Date(), i);
		const iso = toISODate(date);
		return {
			date,
			iso,
			shift: days[iso]
		};
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl bg-card p-3 shadow-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-2 px-0.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground",
			children: "Najbližších 8 dní"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-8 gap-1",
			children: items.map(({ date, iso, shift }) => {
				const holiday = Boolean(getHoliday(iso));
				const kind = shift?.kind ?? "off";
				const weekend = isWeekend(date);
				const weekday = WEEKDAYS[(getDay(date) + 6) % 7];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onSelect(iso),
					className: cn("flex min-h-14 flex-col items-center rounded-lg px-0.5 py-1 text-center outline-none touch-manipulation", "transition-transform duration-150 ease-out active:scale-[0.96]", "focus-visible:ring-2 focus-visible:ring-ring", stripTone(kind, holiday, weekend), isToday(date) && "ring-1 ring-foreground/50"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-2xs font-medium uppercase leading-none opacity-70",
							children: weekday
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 text-xs font-semibold tabular-nums leading-none",
							children: date.getDate()
						}),
						kind !== "off" && shift ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-auto text-2xs font-medium tabular-nums leading-tight",
							children: [
								formatTimeShort(shift.start),
								"–",
								formatTimeShort(shift.end)
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-auto text-2xs leading-none opacity-50",
							children: "·"
						})
					]
				}, iso);
			})
		})]
	});
}
function stripTone(kind, holiday, weekend) {
	if (holiday) return "bg-holiday-dim text-holiday";
	if (kind === "morning") return "bg-morning-dim text-morning";
	if (kind === "night") return "bg-night-dim text-night";
	if (kind === "shift8") return "bg-shift8-dim text-shift8";
	if (kind === "extra") return "bg-extra-dim text-extra";
	if (weekend) return "bg-weekend text-subtle";
	return "bg-off-dim text-off-fg";
}
function YearView({ year, days, onPickMonth }) {
	const standardDailyHours = useShiftStore((s) => s.standardDailyHours);
	const patternStart = useShiftStore((s) => s.patternStart);
	const yearCursor = new Date(year, 0, 1);
	const yearStats = computeStats({
		days,
		from: toISODate(startOfYear(yearCursor)),
		to: toISODate(endOfYear(yearCursor)),
		standardDailyHours,
		patternStart
	});
	const plus = yearStats.delta > 0;
	const minus = yearStats.delta < 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-end justify-between rounded-2xl bg-card px-4 py-3 shadow-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground",
				children: "Saldo roku"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("text-2xl font-semibold tabular-nums tracking-tight", plus && "text-night", minus && "text-holiday"),
				children: formatDelta(yearStats.delta)
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "tabular-nums text-foreground",
					children: yearStats.workDays
				}), " zmien"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-3 sm:grid-cols-3",
			children: Array.from({ length: 12 }, (_, month) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniMonth, {
				year,
				month,
				days,
				onPick: () => onPickMonth(month)
			}, month))
		})]
	});
}
function MiniMonth({ year, month, days, onPick }) {
	const standardDailyHours = useShiftStore((s) => s.standardDailyHours);
	const patternStart = useShiftStore((s) => s.patternStart);
	const start = startOfMonth(new Date(year, month, 1));
	const end = endOfMonth(start);
	const leading = (getDay(start) + 6) % 7;
	const monthDays = eachDayOfInterval({
		start,
		end
	});
	const cells = [];
	for (let i = 0; i < leading; i += 1) cells.push(null);
	cells.push(...monthDays);
	const stats = computeStats({
		days,
		from: toISODate(start),
		to: toISODate(end),
		standardDailyHours,
		patternStart
	});
	const showDelta = stats.workDays > 0 || stats.standardHours > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onPick,
		className: "rounded-2xl bg-card p-3 text-left shadow-border transition-transform duration-150 ease-out active:scale-[0.98]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-2 flex items-baseline justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium capitalize text-muted-foreground",
				children: format(start, "LLLL", { locale: sk })
			}), showDelta ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("text-2xs font-medium tabular-nums", stats.delta > 0 && "text-night", stats.delta < 0 && "text-holiday", stats.delta === 0 && "text-subtle"),
				children: formatDelta(stats.delta)
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-7 gap-0.5",
			children: cells.map((date, i) => {
				if (!date) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "aspect-square" }, `e-${i}`);
				const iso = toISODate(date);
				const shift = days[iso];
				const holiday = Boolean(getHoliday(iso));
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("aspect-square rounded-sm", miniTone(shift?.kind ?? null, holiday)) }, iso);
			})
		})]
	});
}
function miniTone(kind, holiday) {
	if (holiday) return "bg-holiday";
	if (kind === "morning") return "bg-morning";
	if (kind === "night") return "bg-night";
	if (kind === "shift8") return "bg-shift8";
	if (kind === "extra") return "bg-extra";
	if (kind === "off") return "bg-off";
	return "bg-transparent";
}
function CalendarApp() {
	const hasHydrated = useShiftStore((s) => s.hasHydrated);
	const setupDone = useShiftStore((s) => s.setupDone);
	const days = useShiftStore((s) => s.days);
	const swap = useShiftStore((s) => s.swap);
	const patternStart = useShiftStore((s) => s.patternStart);
	const [cursor, setCursor] = (0, import_react.useState)(() => startOfMonth(/* @__PURE__ */ new Date()));
	const [view, setView] = (0, import_react.useState)("month");
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [moveSource, setMoveSource] = (0, import_react.useState)(null);
	const [settingsOpen, setSettingsOpen] = (0, import_react.useState)(false);
	const [wizardOpen, setWizardOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const finish = () => useShiftStore.setState({ hasHydrated: true });
		const unsub = useShiftStore.persist.onFinishHydration(finish);
		if (useShiftStore.persist.hasHydrated()) {
			finish();
			return unsub;
		}
		useShiftStore.persist.rehydrate();
		const fallback = window.setTimeout(finish, 80);
		return () => {
			unsub();
			window.clearTimeout(fallback);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!setupDone || !patternStart) return;
		const start = fromISODate(patternStart);
		if (/* @__PURE__ */ new Date() < start) setCursor(startOfMonth(start));
	}, [setupDone, patternStart]);
	const title = (0, import_react.useMemo)(() => view === "year" ? format(cursor, "yyyy") : formatMonthTitle(cursor), [cursor, view]);
	if (!hasHydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh items-center justify-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMark, { className: "size-12 rounded-2xl" })
	});
	if (!setupDone || wizardOpen) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-dvh bg-background text-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SetupWizard, {
			mode: setupDone ? "regen" : "first",
			onClose: setupDone ? () => setWizardOpen(false) : void 0
		})
	});
	function go(delta) {
		setCursor((c) => view === "year" ? addMonths(c, delta * 12) : addMonths(c, delta));
	}
	function handleSelect(iso) {
		if (moveSource) {
			if (iso !== moveSource) {
				swap(moveSource, iso);
				toast(`Zmena presunutá na ${iso.split("-").reverse().join(".")}`);
			}
			setMoveSource(null);
			return;
		}
		setSelected(iso);
	}
	function handleSwap(from, to) {
		if (from === to) return;
		swap(from, to);
		toast("Zmeny vymenené");
		setMoveSource(null);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-dvh bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMark, { className: "size-9 rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-2xs font-medium uppercase tracking-[0.16em] text-muted-foreground",
								children: "Kalendár zmien"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-lg font-semibold leading-tight tracking-tight",
								children: "Zmeny"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "Nastavenia",
							onClick: () => setSettingsOpen(true),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-5" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon-sm",
								"aria-label": "Späť",
								onClick: () => go(-1),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-semibold capitalize tracking-tight",
									children: title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 inline-flex rounded-full bg-surface-2 p-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setView("month"),
										className: cn("h-9 rounded-full px-3 text-xs font-medium", view === "month" ? "bg-card text-foreground" : "text-muted-foreground"),
										children: "Mesiac"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setView("year"),
										className: cn("h-9 rounded-full px-3 text-xs font-medium", view === "year" ? "bg-card text-foreground" : "text-muted-foreground"),
										children: "Rok"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon-sm",
								"aria-label": "Ďalej",
								onClick: () => go(1),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
							})
						]
					}),
					moveSource ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-xl bg-morning-dim px-3 py-2 text-sm text-morning",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ťukni na deň, kam chceš zmenu presunúť" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "font-medium",
							onClick: () => setMoveSource(null),
							children: "Zrušiť"
						})]
					}) : null,
					view === "month" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatsBar, { cursor }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarMonth, {
							cursor,
							days,
							selected,
							moveSource,
							onSelect: handleSelect,
							onSwipeMonth: (delta) => setCursor((c) => addMonths(c, delta)),
							onSwap: handleSwap,
							onMoveStart: (iso) => {
								setMoveSource(iso);
								toast("Podržané — ťukni cieľový deň");
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpcomingStrip, { onSelect: handleSelect }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setCursor(startOfMonth(/* @__PURE__ */ new Date())),
							className: "self-center text-sm text-muted-foreground",
							children: ["Dnes · ", todayISO().split("-").reverse().join(".")]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InstallHint, {})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YearView, {
						year: cursor.getFullYear(),
						days,
						onPickMonth: (month) => {
							setCursor(startOfMonth(new Date(cursor.getFullYear(), month, 1)));
							setView("month");
						}
					}), patternStart ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-center text-xs text-muted-foreground",
						children: ["Rotácia od ", patternStart.split("-").reverse().join(".")]
					}) : null] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayEditor, {
				iso: selected,
				onClose: () => setSelected(null),
				onMove: (iso) => {
					setMoveSource(iso);
					toast(`Presun: ${KIND_LABEL[days[iso]?.kind ?? "off"]}`);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPanel, {
				open: settingsOpen,
				onOpenChange: setSettingsOpen,
				onNewRotation: () => setWizardOpen(true)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				theme: "dark",
				position: "top-center",
				toastOptions: { className: "bg-card text-foreground border-border" }
			})
		]
	});
}
function Legend() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "flex flex-wrap justify-center gap-x-4 gap-y-2 text-2xs text-muted-foreground",
		children: [
			{
				label: "Ranná",
				className: "bg-morning"
			},
			{
				label: "Nočná",
				className: "bg-night"
			},
			{
				label: "8 h",
				className: "bg-shift8"
			},
			{
				label: "Navyše",
				className: "bg-extra"
			},
			{
				label: "Voľno",
				className: "bg-off"
			},
			{
				label: "Víkend",
				className: "bg-weekend ring-1 ring-border"
			},
			{
				label: "Sviatok",
				className: "bg-holiday"
			}
		].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex items-center gap-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-2 rounded-sm", item.className) }), item.label]
		}, item.label))
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarApp, {});
}
//#endregion
export { Home as component };
