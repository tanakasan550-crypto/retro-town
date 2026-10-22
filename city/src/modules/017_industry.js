  // src/industry.js
  var CATS = { retail: "\u5C0F\u58F2", food: "\u98F2\u98DF", service: "\u751F\u6D3B\u30B5\u30FC\u30D3\u30B9", edu: "\u6559\u80B2", med: "\u533B\u7642\u30FB\u798F\u7949", public: "\u793E\u4F1A\u30FB\u516C\u5171\u30FB\u74B0\u5883", life: "\u4EBA\u751F\u30FB\u5100\u793C", fin: "\u91D1\u878D\u30FB\u5C02\u9580\u8077", other: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02\u6A5F\u80FD" };
  var R2 = (id, n2, cat, hosts, cap2, rent, cogs, tk, foot, job, staff, hrs, goods) => ({ id, n: n2, cat, hosts, cap: cap2, rent, cogs, tk, foot, job, staff, hrs, goods });
  var SHOPH = ["shop", "mall", "dept", "konbini"];
  var FOODH = ["restaurant", "cafe", "ramen", "izakaya", "seafood", "shop"];
  var OFFH = ["office", "tower", "shop"];
  var INDUSTRIES = [
    // 小売
    R2("bookstore", "\u672C\u5C4B", "retail", ["bookstore", "shop", "mall"], 35e5, 15e4, 0.72, 1400, 3, "clerk", 2, "10-21", "\u672C\u30FB\u96D1\u8A8C\u30FB\u53C2\u8003\u66F8"),
    R2("stationery", "\u6587\u623F\u5177\u5E97", "retail", SHOPH, 25e5, 12e4, 0.65, 900, 3, "clerk", 1, "9-19", "\u30CE\u30FC\u30C8\u30FB\u30DA\u30F3\u30FB\u7B46\u7BB1"),
    R2("homecenter", "\u30DB\u30FC\u30E0\u30BB\u30F3\u30BF\u30FC", "retail", ["homecenter", "mall"], 2e7, 6e5, 0.78, 3200, 4, "clerk", 6, "8-20", "\u5DE5\u5177\u30FB\u5712\u82B8\u7528\u54C1\u30FB\u5BB6\u5177\u30FB\u751F\u6D3B\u7528\u54C1"),
    R2("drugstore", "\u30C9\u30E9\u30C3\u30B0\u30B9\u30C8\u30A2", "retail", ["pharmacy", "shop", "mall"], 12e6, 4e5, 0.8, 1800, 4, "clerk", 4, "9-22", "\u533B\u85AC\u54C1\u30FB\u65E5\u7528\u54C1\u30FB\u5316\u7CA7\u54C1"),
    R2("electronics", "\u5BB6\u96FB\u91CF\u8CA9\u5E97", "retail", ["mall", "dept", "shop"], 3e7, 8e5, 0.82, 12e3, 3, "clerk", 8, "10-20", "\u5BB6\u96FB\u30FB\u30D1\u30BD\u30B3\u30F3\u30FB\u643A\u5E2F"),
    R2("florist", "\u82B1\u5C4B", "retail", ["shop"], 2e6, 1e5, 0.55, 1800, 2, "clerk", 1, "9-19", "\u5207\u308A\u82B1\u30FB\u9262\u690D\u3048\u30FB\u82B1\u675F"),
    R2("furniture", "\u5BB6\u5177\u5E97", "retail", ["shop", "mall", "dept"], 9e6, 3e5, 0.68, 3e4, 2, "clerk", 3, "10-19", "\u5BB6\u5177\u30FB\u30A4\u30F3\u30C6\u30EA\u30A2"),
    R2("sports", "\u30B9\u30DD\u30FC\u30C4\u7528\u54C1\u5E97", "retail", ["shop", "mall", "dept"], 6e6, 25e4, 0.72, 5e3, 2, "clerk", 2, "10-20", "\u30A6\u30A7\u30A2\u30FB\u30DC\u30FC\u30EB\u30FB\u91E3\u5177"),
    R2("toys", "\u73A9\u5177\u5E97", "retail", ["shop", "mall", "dept"], 4e6, 18e4, 0.7, 2800, 3, "clerk", 2, "10-19", "\u304A\u3082\u3061\u3083\u30FB\u30B2\u30FC\u30E0"),
    R2("optical", "\u773C\u93E1\u5E97", "retail", ["shop", "mall"], 5e6, 2e5, 0.45, 25e3, 2, "clerk", 2, "10-19", "\u773C\u93E1\u30FB\u30B3\u30F3\u30BF\u30AF\u30C8\u30FB\u88DC\u8074\u5668"),
    R2("petshop", "\u30DA\u30C3\u30C8\u7528\u54C1\u5E97", "retail", ["shop", "mall"], 45e5, 18e4, 0.7, 3e3, 2, "clerk", 2, "10-20", "\u30D5\u30FC\u30C9\u30FB\u30B1\u30FC\u30B8\u30FB\u30C8\u30EA\u30DF\u30F3\u30B0\u7528\u54C1"),
    R2("recycle", "\u30EA\u30B5\u30A4\u30AF\u30EB\u30B7\u30E7\u30C3\u30D7", "retail", ["shop", "warehouse"], 3e6, 12e4, 0.5, 2e3, 2, "clerk", 2, "10-19", "\u4E2D\u53E4\u54C1\u306E\u8CB7\u53D6\u30FB\u8CA9\u58F2"),
    R2("butcher", "\u7CBE\u8089\u5E97", "retail", ["shop"], 3e6, 1e5, 0.7, 1800, 3, "clerk", 2, "9-19", "\u7CBE\u8089\u30FB\u60E3\u83DC"),
    R2("liquor", "\u9152\u5C4B", "retail", ["shop", "konbini"], 35e5, 11e4, 0.8, 2200, 2, "clerk", 1, "9-21", "\u9152\u30FB\u98F2\u6599"),
    R2("bicycle", "\u81EA\u8EE2\u8ECA\u5E97", "retail", ["shop"], 35e5, 11e4, 0.75, 15e3, 2, "clerk", 1, "9-19", "\u81EA\u8EE2\u8ECA\u30FB\u4FEE\u7406"),
    R2("camera", "\u5199\u771F\u9928", "retail", ["shop"], 4e6, 13e4, 0.4, 8e3, 1, "clerk", 1, "9-18", "\u8A18\u5FF5\u64AE\u5F71\u30FB\u30D7\u30EA\u30F3\u30C8"),
    R2("clothes_shop", "\u6D0B\u54C1\u5E97", "retail", ["clothes", "shop", "mall"], 5e6, 2e5, 0.62, 6e3, 3, "clerk", 2, "10-19", "\u8863\u6599\u30FB\u9774"),
    // 飲食
    R2("pizza", "\u30D4\u30B6\u5E97", "food", FOODH, 6e6, 22e4, 0.32, 1800, 3, "cook", 3, "11-22", "\u5E97\u5185\u98F2\u98DF\u30FB\u6301\u3061\u5E30\u308A\u30FB\u914D\u9054"),
    R2("bakery", "\u30D1\u30F3\u5C4B", "food", ["shop", "cafe"], 5e6, 16e4, 0.33, 900, 4, "cook", 2, "7-18", "\u713C\u304D\u305F\u3066\u30D1\u30F3\u30FB\u30B5\u30F3\u30C9\u30A4\u30C3\u30C1"),
    R2("fastfood", "\u30D5\u30A1\u30B9\u30C8\u30D5\u30FC\u30C9\u5E97", "food", FOODH, 1e7, 35e4, 0.35, 850, 5, "waitstaff", 5, "7-24", "\u30CF\u30F3\u30D0\u30FC\u30AC\u30FC\u30FB\u30C9\u30EA\u30F3\u30AF"),
    R2("bentoya", "\u5F01\u5F53\u5E97", "food", ["shop"], 35e5, 12e4, 0.4, 700, 4, "cook", 2, "6-15", "\u65E5\u66FF\u308F\u308A\u5F01\u5F53\u30FB\u914D\u9054"),
    R2("kissaten", "\u55AB\u8336\u5E97", "food", ["cafe"], 4e6, 14e4, 0.3, 900, 3, "waitstaff", 2, "7-21", "\u30B3\u30FC\u30D2\u30FC\u30FB\u8EFD\u98DF"),
    R2("family", "\u30D5\u30A1\u30DF\u30EA\u30FC\u30EC\u30B9\u30C8\u30E9\u30F3", "food", ["restaurant"], 25e6, 7e5, 0.34, 1500, 5, "waitstaff", 8, "7-26", "\u6D0B\u98DF\u30FB\u548C\u98DF\u30FB\u30C9\u30EA\u30F3\u30AF\u30D0\u30FC"),
    R2("shokudo", "\u98DF\u5802", "food", ["restaurant", "shop"], 4e6, 13e4, 0.38, 950, 4, "cook", 2, "11-21", "\u5B9A\u98DF\u30FB\u4E3C"),
    R2("sushi", "\u5BFF\u53F8\u5E97", "food", ["restaurant", "shop"], 12e6, 3e5, 0.38, 4500, 2, "cook", 3, "11-22", "\u63E1\u308A\u30FB\u5DFB\u7269"),
    R2("washoku", "\u548C\u98DF\u5E97", "food", ["restaurant"], 12e6, 32e4, 0.35, 3800, 2, "cook", 3, "11-22", "\u4F1A\u5E2D\u30FB\u5B9A\u98DF"),
    R2("yoshoku", "\u6D0B\u98DF\u5E97", "food", ["restaurant"], 9e6, 26e4, 0.34, 2200, 3, "cook", 3, "11-22", "\u30CF\u30F3\u30D0\u30FC\u30B0\u30FB\u30AA\u30E0\u30E9\u30A4\u30B9"),
    // 生活サービス
    R2("cleaning", "\u30AF\u30EA\u30FC\u30CB\u30F3\u30B0\u5E97", "service", ["shop"], 8e6, 15e4, 0.2, 1500, 3, "clerk", 2, "8-19", "\u30AF\u30EA\u30FC\u30CB\u30F3\u30B0"),
    R2("laundromat", "\u30B3\u30A4\u30F3\u30E9\u30F3\u30C9\u30EA\u30FC", "service", ["shop"], 7e6, 12e4, 0.18, 600, 2, "cleaner", 0, "0-24", "\u30B3\u30A4\u30F3\u30E9\u30F3\u30C9\u30EA\u30FC(\u7121\u4EBA)"),
    R2("salon", "\u7406\u7F8E\u5BB9\u5BA4", "service", ["shop"], 4e6, 14e4, 0.12, 4e3, 3, "clerk", 2, "9-19", "\u30AB\u30C3\u30C8\u30FB\u30D1\u30FC\u30DE\u30FB\u30AB\u30E9\u30FC"),
    R2("homerepair", "\u4F4F\u5B85\u4FEE\u7406\u696D", "service", OFFH, 3e6, 8e4, 0.4, 25e3, 1, "carpenter", 3, "8-18", "\u4FEE\u7E55\u30FB\u6C34\u56DE\u308A\u30FB\u5185\u88C5"),
    R2("gardener", "\u5EAD\u5E2B\u30FB\u9020\u5712\u696D", "service", ["office", "warehouse"], 25e5, 6e4, 0.3, 3e4, 1, "carpenter", 2, "8-17", "\u526A\u5B9A\u30FB\u690D\u683D\u30FB\u5EAD\u306E\u7DAD\u6301\u7BA1\u7406"),
    R2("cleaningco", "\u6E05\u6383\u696D", "service", OFFH, 2e6, 6e4, 0.15, 6e4, 1, "cleaner", 4, "5-20", "\u4F4F\u5B85\u30FB\u30AA\u30D5\u30A3\u30B9\u30FB\u516C\u5171\u65BD\u8A2D\u306E\u6E05\u6383\u5951\u7D04"),
    R2("pestcontrol", "\u5BB3\u866B\u5BFE\u7B56\u696D", "service", OFFH, 25e5, 6e4, 0.25, 2e4, 1, "cleaner", 2, "8-18", "\u99C6\u9664\u30FB\u6D88\u6BD2"),
    R2("moving", "\u5F15\u3063\u8D8A\u3057\u696D", "service", ["logistics", "warehouse"], 15e6, 2e5, 0.35, 6e4, 1, "logistics", 6, "7-19", "\u5F15\u3063\u8D8A\u3057\u30FB\u8377\u9020\u308A"),
    R2("delivery", "\u914D\u9001\u4F1A\u793E", "service", ["logistics", "warehouse"], 2e7, 3e5, 0.4, 900, 1, "logistics", 8, "6-21", "\u5B85\u914D\u30FB\u96C6\u8377"),
    R2("security", "\u8B66\u5099\u4F1A\u793E", "service", OFFH, 6e6, 1e5, 0.3, 5e4, 1, "logistics", 5, "0-24", "\u5E38\u99D0\u30FB\u5DE1\u56DE\u8B66\u5099"),
    R2("printing", "\u5370\u5237\u6240", "service", ["factory", "office"], 12e6, 2e5, 0.5, 2e4, 1, "factory", 3, "8-18", "\u540D\u523A\u30FB\u30C1\u30E9\u30B7\u30FB\u88FD\u672C"),
    R2("travel", "\u65C5\u884C\u4EE3\u7406\u5E97", "service", ["shop", "office"], 35e5, 13e4, 0.5, 6e4, 2, "clerk", 2, "9-18", "\u65C5\u884C\u30FB\u30C1\u30B1\u30C3\u30C8"),
    // 教育
    R2("cram", "\u5B66\u7FD2\u587E", "edu", ["cram", "office", "shop"], 6e6, 2e5, 0.1, 22e3, 2, "teacher", 3, "15-22", "\u6388\u696D\u30FB\u751F\u5F92\u7BA1\u7406(\u587E\u8B1B\u5E2B\u306E\u7D66\u4E0E\u3068\u9023\u52D5)"),
    R2("tutor", "\u5BB6\u5EAD\u6559\u5E2B\u6D3E\u9063", "edu", ["office", "shop"], 15e5, 6e4, 0.45, 12e3, 1, "teacher", 3, "14-22", "\u5BB6\u5EAD\u8A2A\u554F\u6307\u5C0E(\u5B66\u529B\u306B\u5F71\u97FF)"),
    R2("prepschool", "\u4E88\u5099\u6821", "edu", ["cram", "office"], 25e6, 6e5, 0.15, 45e3, 2, "teacher", 8, "9-21", "\u5927\u5B66\u53D7\u9A13\u6307\u5C0E"),
    R2("music_school", "\u97F3\u697D\u6559\u5BA4", "edu", ["shop", "office"], 5e6, 16e4, 0.15, 9e3, 2, "teacher", 2, "12-20", "\u30D4\u30A2\u30CE\u30FB\u30AE\u30BF\u30FC\u30FB\u58F0\u697D"),
    R2("lessons", "\u7FD2\u3044\u4E8B\u6559\u5BA4", "edu", ["shop", "gym", "office"], 4e6, 14e4, 0.15, 8e3, 3, "teacher", 2, "14-21", "\u66F8\u9053\u30FB\u305D\u308D\u3070\u3093\u30FB\u82F1\u4F1A\u8A71\u30FB\u6C34\u6CF3"),
    R2("edu_corp", "\u6559\u80B2\u4E8B\u696D(\u7D4C\u55B6)", "edu", ["office"], 3e7, 5e5, 0.2, 6e4, 2, "teacher", 10, "9-20", "\u6559\u5BA4\u30C1\u30A7\u30FC\u30F3\u306E\u7D4C\u55B6"),
    // 医療・福祉
    R2("gp", "\u8A3A\u7642\u6240", "med", ["clinic", "office"], 4e7, 7e5, 0.18, 7e3, 3, "nurse", 3, "9-18", "\u5185\u79D1\u30FB\u5C0F\u5150\u79D1(\u533B\u5E2B\u514D\u8A31\u304C\u5FC5\u8981)"),
    R2("dental", "\u6B6F\u79D1", "med", ["clinic", "office"], 35e6, 6e5, 0.15, 8e3, 3, "nurse", 3, "9-19", "\u6B6F\u79D1\u8A3A\u7642(\u6B6F\u79D1\u533B\u5E2B\u514D\u8A31\u304C\u5FC5\u8981)"),
    R2("derm", "\u7F8E\u5BB9\u76AE\u819A\u79D1", "med", ["clinic", "office"], 45e6, 9e5, 0.2, 3e4, 2, "nurse", 3, "10-19", "\u81EA\u7531\u8A3A\u7642(\u5408\u4F75\u75C7\u7B49\u306E\u30EA\u30B9\u30AF\u8AAC\u660E\u30FB\u540C\u610F\u304C\u5FC5\u9808)"),
    R2("plastic", "\u7F8E\u5BB9\u5916\u79D1", "med", ["clinic", "hospital"], 6e7, 12e5, 0.2, 25e4, 1, "nurse", 4, "10-19", "\u624B\u8853\u30FB\u65BD\u8853(18\u6B73\u672A\u6E80\u306F\u4FDD\u8B77\u8005\u540C\u610F\u30FB\u30EA\u30B9\u30AF\u8AAC\u660E\u304C\u5FC5\u9808\u3002\u7D50\u679C\u306F\u4FDD\u8A3C\u3057\u306A\u3044)"),
    R2("pharmacy_biz", "\u85AC\u5C40(\u8ABF\u5264)", "med", ["pharmacy"], 2e7, 4e5, 0.7, 3500, 3, "pharmacist", 2, "9-19", "\u8ABF\u5264\u30FB\u670D\u85AC\u6307\u5C0E"),
    R2("nursinghome", "\u4ECB\u8B77\u65BD\u8A2D", "med", ["nursing"], 8e7, 15e5, 0.1, 25e4, 2, "caregiver", 12, "0-24", "\u5165\u6240\u4ECB\u8B77"),
    R2("homecare", "\u8A2A\u554F\u4ECB\u8B77", "med", ["office", "nursing"], 6e6, 1e5, 0.1, 6e3, 1, "caregiver", 5, "7-20", "\u8A2A\u554F\u4ECB\u8B77\u30FB\u898B\u5B88\u308A"),
    R2("rehab", "\u30EA\u30CF\u30D3\u30EA\u65BD\u8A2D", "med", ["clinic", "nursing", "gym"], 25e6, 4e5, 0.12, 9e3, 2, "caregiver", 4, "9-17", "\u6A5F\u80FD\u56DE\u5FA9\u8A13\u7DF4"),
    R2("vet", "\u52D5\u7269\u75C5\u9662", "med", ["clinic", "shop"], 3e7, 45e4, 0.25, 6e3, 2, "nurse", 2, "9-19", "\u30DA\u30C3\u30C8\u306E\u8A3A\u7642"),
    // 社会・公共・環境
    R2("waste", "\u3054\u307F\u53CE\u96C6\u4F1A\u793E", "public", ["logistics", "warehouse"], 3e7, 3e5, 0.3, 9e4, 1, "logistics", 8, "6-16", "\u4E00\u822C\u5EC3\u68C4\u7269\u306E\u53CE\u96C6(\u81EA\u6CBB\u4F53\u59D4\u8A17)"),
    R2("sanitation", "\u885B\u751F\u4E8B\u696D\u8005(\u30D0\u30AD\u30E5\u30FC\u30E0\u30AB\u30FC)", "public", ["logistics", "warehouse"], 2e7, 2e5, 0.3, 5e4, 1, "logistics", 4, "7-17", "\u6D44\u5316\u69FD\u6E05\u6383\u30FB\u304F\u307F\u53D6\u308A(\u5730\u57DF\u30FB\u65BD\u8A2D\u306E\u885B\u751F\u696D\u52D9)"),
    R2("roadclean", "\u9053\u8DEF\u6E05\u6383\u4F1A\u793E", "public", ["logistics", "warehouse"], 15e6, 15e4, 0.25, 8e4, 1, "cleaner", 5, "4-12", "\u9053\u8DEF\u6E05\u6383\u30FB\u9664\u96EA"),
    R2("waterworks", "\u4E0A\u4E0B\u6C34\u9053\u95A2\u9023", "public", ["office"], 4e7, 4e5, 0.3, 12e4, 1, "carpenter", 8, "8-17", "\u7D66\u6392\u6C34\u8A2D\u5099\u30FB\u7BA1\u8DEF\u4FDD\u5B88"),
    R2("postal", "\u90F5\u4FBF\u30FB\u904B\u8F38\u95A2\u9023", "public", ["office", "logistics"], 3e7, 4e5, 0.3, 700, 3, "logistics", 8, "8-19", "\u90F5\u4FBF\u30FB\u5C0F\u5305"),
    R2("fire_police", "\u6D88\u9632\u30FB\u8B66\u5BDF\u95A2\u9023\u4E8B\u696D", "public", ["office"], 0, 0, 0, 0, 1, "firefighter", 0, "0-24", "\u516C\u5171(\u6C11\u9593\u7D4C\u55B6\u306E\u5BFE\u8C61\u5916)"),
    // 人生・儀礼
    R2("funeral_co", "\u846C\u5100\u793E", "life", ["funeral", "office"], 2e7, 3e5, 0.45, 12e5, 1, "funeralstaff", 4, "0-24", "\u846C\u5100\u306E\u6E96\u5099\u3068\u9032\u884C(\u4EBA\u751F\u30A4\u30D9\u30F3\u30C8\u3068\u9023\u52D5)"),
    R2("funeral_hall", "\u846C\u5100\u5834", "life", ["funeral"], 8e7, 8e5, 0.3, 6e5, 1, "funeralstaff", 5, "0-24", "\u5F0F\u5834\u30FB\u5B89\u7F6E"),
    R2("crematorium_op", "\u706B\u846C\u5834\u904B\u55B6", "life", ["crematorium"], 15e7, 15e5, 0.2, 8e4, 1, "funeralstaff", 5, "8-16", "\u706B\u846C(\u81EA\u6CBB\u4F53\u904B\u55B6\u304C\u4E2D\u5FC3)"),
    R2("cemetery_op", "\u5893\u5730\u7BA1\u7406\u696D", "life", ["cemetery", "temple"], 2e7, 1e5, 0.1, 8e5, 1, "priest", 2, "8-17", "\u5893\u6240\u306E\u7BA1\u7406\u30FB\u6C38\u4EE3\u4F9B\u990A"),
    R2("wedding", "\u5F0F\u5834\u904B\u55B6", "life", ["hotel", "resorthotel", "office"], 9e7, 1e6, 0.5, 3e6, 1, "hotelstaff", 8, "9-21", "\u7D50\u5A5A\u5F0F\u30FB\u62AB\u9732\u5BB4"),
    R2("hearse", "\u970A\u67E9\u8ECA\u30FB\u846C\u796D\u8ECA\u4E21", "life", ["funeral"], 12e6, 1e5, 0.3, 8e4, 1, "logistics", 2, "0-24", "\u970A\u67E9\u30FB\u9001\u8FCE(\u95A2\u9023\u8ECA\u4E21)"),
    // 金融・専門職
    R2("insurer", "\u4FDD\u967A\u4F1A\u793E", "fin", ["office", "tower"], 3e8, 3e6, 0.55, 1e5, 1, "officeworker", 30, "9-17", "\u5951\u7D04\u30FB\u4FDD\u967A\u6599\u30FB\u8ACB\u6C42\u30FB\u652F\u6255\u306E\u7BA1\u7406"),
    R2("insagent", "\u4FDD\u967A\u4EE3\u7406\u5E97", "fin", ["office", "shop"], 4e6, 13e4, 0.3, 8e4, 2, "officeworker", 2, "9-18", "\u81EA\u52D5\u8ECA\u30FB\u706B\u707D\u30FB\u751F\u547D\u4FDD\u967A\u306E\u4EE3\u7406"),
    R2("realestate", "\u4E0D\u52D5\u7523\u4F1A\u793E", "fin", ["office", "shop"], 6e6, 16e4, 0.15, 4e5, 2, "officeworker", 3, "9-18", "\u58F2\u8CB7\u30FB\u8CC3\u8CB8\u30FB\u7BA1\u7406\u306E\u4EF2\u4ECB"),
    R2("taxacc", "\u7A0E\u7406\u58EB\u4E8B\u52D9\u6240", "fin", ["office"], 3e6, 1e5, 0.1, 8e4, 1, "officeworker", 2, "9-18", "\u78BA\u5B9A\u7533\u544A\u30FB\u6CD5\u4EBA\u7A0E\u52D9"),
    R2("lawoffice", "\u6CD5\u5F8B\u4E8B\u52D9\u6240", "fin", ["lawfirm", "office"], 8e6, 2e5, 0.1, 15e4, 1, "lawyer", 2, "9-18", "\u8A34\u8A1F\u30FB\u5951\u7D04\u30FB\u76F8\u8AC7"),
    R2("accounting", "\u4F1A\u8A08\u4E8B\u52D9\u6240", "fin", ["office"], 5e6, 15e4, 0.1, 1e5, 1, "officeworker", 3, "9-18", "\u8A18\u5E33\u30FB\u76E3\u67FB"),
    R2("bank_biz", "\u9280\u884C", "fin", ["bank"], 5e8, 4e6, 0.4, 2e4, 4, "banker", 20, "9-15", "\u9810\u91D1\u30FB\u878D\u8CC7\u30FB\u70BA\u66FF"),
    R2("consulting", "\u7D4C\u55B6\u30B3\u30F3\u30B5\u30EB\u30C6\u30A3\u30F3\u30B0\u4F1A\u793E", "fin", ["office", "tower"], 6e6, 22e4, 0.15, 3e5, 1, "officeworker", 3, "9-19", "\u7D4C\u55B6\u52A9\u8A00\u30FB\u518D\u5EFA\u652F\u63F4"),
    // その他
    R2("autorepair", "\u4FEE\u7406\u5DE5\u5834", "other", ["gasstation", "factory", "cardealer"], 15e6, 25e4, 0.45, 8e4, 2, "carpenter", 3, "8-18", "\u8ECA\u691C\u30FB\u4FEE\u7406\u30FB\u30EC\u30C3\u30AB\u30FC"),
    R2("towing", "\u30EC\u30C3\u30AB\u30FC\u696D", "other", ["gasstation", "logistics"], 12e6, 15e4, 0.3, 25e3, 1, "logistics", 2, "0-24", "\u4E8B\u6545\u30FB\u6545\u969C\u8ECA\u306E\u642C\u9001"),
    R2("karaoke", "\u30AB\u30E9\u30AA\u30B1\u5E97", "other", ["shop", "mall", "gamecenter"], 15e6, 35e4, 0.2, 1800, 4, "clerk", 3, "11-26", "\u6B4C\u30FB\u98F2\u98DF"),
    R2("chiropractic", "\u6574\u9AA8\u9662\u30FB\u937C\u7078\u9662", "other", ["clinic", "shop"], 5e6, 13e4, 0.1, 5e3, 2, "nurse", 1, "9-20", "\u65BD\u8853\u30FB\u30EA\u30CF\u30D3\u30EA"),
    R2("nursery", "\u4FDD\u80B2\u5712\u904B\u55B6", "other", ["kinder"], 4e7, 5e5, 0.1, 6e4, 2, "childcare", 6, "7-19", "\u4FDD\u80B2"),
    R2("newspaper", "\u65B0\u805E\u8CA9\u58F2\u5E97", "other", ["shop"], 3e6, 9e4, 0.7, 3900, 2, "logistics", 3, "3-17", "\u65B0\u805E\u914D\u9054\u30FB\u96C6\u91D1")
  ];
  var IND = Object.fromEntries(INDUSTRIES.map((x) => [x.id, x]));
  var byCat = (cat) => INDUSTRIES.filter((x) => x.cat === cat);

