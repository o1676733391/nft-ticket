// src/data/homeData.js

// ======= RANDOM HELPERS =======
// Random location
const LOCATIONS = ["hcm", "hn", "dl", "other"];
const randomLocation = () =>
  LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

// helper thêm location vào event list
const addLocation = (list) =>
  list.map((ev) => ({
    ...ev,
    location: randomLocation(),
  }));

export const homeData = {
  organizer: {
    logo: require("../../asset/concert-show-performance.jpg"),
    name: "KidZania Hà Nội",
    company: "Công ty TNHH MBC PLAYBE VIỆT NAM",
    taxCode: "0110191692",
    address: "Tầng 5, TTTM Lotte Tây Hồ, 272 Đ. Võ Chí Công, Tây Hồ, Hà Nội",
    hotline: "1900 0114",
    email: "kidzaniavn_fb@kidzania.com.vn",
  },
  heroBanners: [
    {
      id: "h1",
      title: "Concert festival",
      image: require("../../asset/concert-past.jpg"),
      date: "07.12.2025",
      price: "Từ 200.000đ",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "h2",
      title: "Vibrant concert",
      image: require("../../asset/vibrant-concert-stage.png"),
      date: "07.12.2025",
      price: "Từ 200.000đ",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "h3",
      title: "Concert festival",
      image: require("../../asset/concert-past.jpg"),
      date: "07.12.2025",
      price: "Từ 200.000đ",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "h4",
      title: "Vibrant concert",
      image: require("../../asset/vibrant-concert-stage.png"),
      date: "07.12.2025",
      price: "Từ 200.000đ",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "h5",
      title: "Concert festival",
      image: require("../../asset/concert-past.jpg"),
      date: "07.12.2025",
      price: "Từ 200.000đ",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "h6",
      title: "Vibrant concert",
      image: require("../../asset/vibrant-concert-stage.png"),
      date: "07.12.2025",
      price: "Từ 200.000đ",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  specialEvents: addLocation([
    {
      id: "s1",
      title: "Chillies Live",
      image: require("../../asset/concert-past.jpg"),
      date: "07.12.2025",
      price: "Từ 200.000đ",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s2",
      title: "Maydays Concert",
      image: require("../../asset/vibrant-concert-stage.png"),
      date: "20.12.2025",
      price: "Từ 400.000đ",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s3",
      title: "Chillies Live",
      image: require("../../asset/hoai-lam-liveshow.jpg"),
      date: "07.12.2025",
      price: "Từ 200.000đ",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s4",
      title: "Maydays Concert",
      image: require("../../asset/event-showcase.jpg"),
      date: "20.12.2025",
      price: "Từ 400.000đ",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s5",
      title: "Chillies Live",
      image: require("../../asset/concert-past.jpg"),
      date: "07.12.2025",
      price: "Từ 200.000đ",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "s6",
      title: "Maydays Concert",
      image: require("../../asset/vibrant-concert-stage.png"),
      date: "20.12.2025",
      price: "Từ 400.000đ",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
  ]),

  trendingEvents: [
    {
      id: "t1",
      title: "Anh trai say hi Concert 2025",
      image: require("../../asset/concert-past.jpg"),
      date: "07.12.2025",
      price: "Từ 200.000đ",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "t2",
      title: "Summer Music Festival",
      image: require("../../asset/vibrant-concert-stage.png"),
      date: "07.12.2025",
      price: "Từ 200.000đ",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "t3",
      title: "The Nutcracker Ballet",
      image: require("../../asset/concert-past.jpg"),
      date: "07.12.2025",
      price: "Từ 200.000đ",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "t4",
      title: "City Pop Live Show",
      image: require("../../asset/vibrant-concert-stage.png"),
      date: "07.12.2025",
      price: "Từ 200.000đ",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "t5",
      title: "City Pop Live Show",
      image: require("../../asset/vibrant-concert-stage.png"),
      date: "07.12.2025",
      price: "Từ 200.000đ",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "t6",
      title: "City Pop Live Show",
      image: require("../../asset/vibrant-concert-stage.png"),
      date: "07.12.2025",
      price: "Từ 200.000đ",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  forYouEvents: addLocation([
    {
      id: "f1",
      title: "THE GENTLEMEN - COUNTDOWN CONCERT 2026",
      image: require("../../asset/concert-past.jpg"),
      price: "Từ 900.000đ",
      date: "31 tháng 12, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "f2",
      title: "CHÀO SHOW",
      image: require("../../asset/vibrant-concert-stage.png"),
      price: "Từ 1.040.000đ",
      date: "25 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "f3",
      title: "COUNTDOWN PARTY 2026 - DANANG'S BIGGEST BOLLYWOOD BASH",
      image: require("../../asset/concert-past.jpg"),
      price: "Từ 500.000đ",
      date: "31 tháng 12, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "f4",
      title: '[GARDEN ART] - ART WORKSHOP "TIRAMISU MOUSSE CAKE"',
      image: require("../../asset/vibrant-concert-stage.png"),
      price: "Từ 390.000đ",
      date: "13 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "f5",
      title: '[GARDEN ART] - ART WORKSHOP "TIRAMISU MOUSSE CAKE"',
      image: require("../../asset/vibrant-concert-stage.png"),
      price: "Từ 390.000đ",
      date: "13 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "f6",
      title: '[GARDEN ART] - ART WORKSHOP "TIRAMISU MOUSSE CAKE"',
      image: require("../../asset/vibrant-concert-stage.png"),
      price: "Từ 390.000đ",
      date: "13 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
  ]),

  weekendEvents: addLocation([
    {
      id: "w1",
      title: "[LEMLAB] Workshop TRẢI NGHIỆM LÀM GỐM",
      image: require("../../asset/concert-past.jpg"),
      price: "Từ 400.000đ",
      date: "25 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "w2",
      title: "[DÉ GARDEN] Kokedama Workshop",
      image: require("../../asset/vibrant-concert-stage.png"),
      price: "Từ 350.000đ",
      date: "25 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "w3",
      title: 'ART WORKSHOP "VIETNAM COFFEE MARTINI TIRAMISU"',
      image: require("../../asset/concert-past.jpg"),
      price: "Từ 420.000đ",
      date: "27 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "w4",
      title: "HUE - 100 Flavors",
      image: require("../../asset/vibrant-concert-stage.png"),
      price: "Từ 9.000.000đ",
      date: "28 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "w5",
      title: "HUE - 100 Flavors",
      image: require("../../asset/vibrant-concert-stage.png"),
      price: "Từ 9.000.000đ",
      date: "28 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "w6",
      title: "HUE - 100 Flavors",
      image: require("../../asset/vibrant-concert-stage.png"),
      price: "Từ 9.000.000đ",
      date: "28 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
  ]),

  monthEvents: addLocation([
    {
      id: "m1",
      title: "Ngắm nhìn bầu trời đêm",
      image: require("../../asset/nha-trang-observatory-sky.jpg"),
      price: "Từ 30.000đ",
      date: "08 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "m2",
      title: "Workshop Gốm Trẻ Em",
      image: require("../../asset/vibrant-concert-stage.png"),
      price: "Từ 350.000đ",
      date: "25 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "m3",
      title: "Workshop Vẽ Ly Gốm",
      image: require("../../asset/concert-past.jpg"),
      price: "Từ 180.000đ",
      date: "25 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "m4",
      title: "Terrarium Workshop",
      image: require("../../asset/vibrant-concert-stage.png"),
      price: "Từ 445.000đ",
      date: "25 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "m5",
      title: "Terrarium Workshop",
      image: require("../../asset/vibrant-concert-stage.png"),
      price: "Từ 445.000đ",
      date: "25 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "m6",
      title: "Terrarium Workshop",
      image: require("../../asset/vibrant-concert-stage.png"),
      price: "Từ 445.000đ",
      date: "25 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
  ]),

  liveMusicEvents: addLocation([
    {
      id: "l1",
      title: "[BẾN THÀNH] Đêm nhạc Cẩm Ly",
      image: require("../../asset/nostalgie-event.jpg"),
      price: "Từ 500.000đ",
      date: "28 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "l2",
      title: "[BẾN THÀNH] Đêm nhạc Phan Mạnh Quỳnh",
      image: require("../../asset/michelin-chefs-event.jpg"),
      price: "Từ 600.000đ",
      date: "04 tháng 12, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "l3",
      title: "[BẾN THÀNH] Đêm nhạc Cẩm Ly",
      image: require("../../asset/nostalgie-da-lat-winter.jpg"),
      price: "Từ 500.000đ",
      date: "28 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "l4",
      title: "[BẾN THÀNH] Đêm nhạc Phan Mạnh Quỳnh",
      image: require("../../asset/nostalgie-da-lat-winter.jpg"),
      price: "Từ 600.000đ",
      date: "04 tháng 12, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "l5",
      title: "[BẾN THÀNH] Đêm nhạc Phan Mạnh Quỳnh",
      image: require("../../asset/nostalgie-da-lat-winter.jpg"),
      price: "Từ 600.000đ",
      date: "04 tháng 12, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "l6",
      title: "[BẾN THÀNH] Đêm nhạc Phan Mạnh Quỳnh",
      image: require("../../asset/nostalgie-da-lat-winter.jpg"),
      price: "Từ 600.000đ",
      date: "04 tháng 12, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
  ]),

  stageArtEvents: addLocation([
    {
      id: "sa1",
      title: "TẤM CÁM ĐẠI CHIẾN!",
      image: require("../../asset/live-performance.png"),
      price: "Từ 270.000đ",
      date: "28 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "sa2",
      title: "THE ALMA SHOW",
      image: require("../../asset/live-performance.png"),
      price: "Từ 600.000đ",
      date: "26 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      time: "00:00 - 23:59",
      dayOfWeek: "T6", // Thứ 6
      dateText: "28 Tháng 11, 2025",
    },
    {
      id: "sa3",
      title: "TẤM CÁM ĐẠI CHIẾN!",
      image: require("../../asset/live-performance.png"),
      price: "Từ 270.000đ",
      date: "28 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "sa4",
      title: "THE ALMA SHOW",
      image: require("../../asset/live-performance.png"),
      price: "Từ 600.000đ",
      date: "26 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "sa5",
      title: "TẤM CÁM ĐẠI CHIẾN!",
      image: require("../../asset/live-performance.png"),
      price: "Từ 270.000đ",
      date: "28 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "sa6",
      title: "THE ALMA SHOW",
      image: require("../../asset/live-performance.png"),
      price: "Từ 600.000đ",
      date: "26 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
  ]),

  otherCategoryEvents: addLocation([
    {
      id: "oc1",
      title: "LIÊN KẾT GIA TỘC",
      image: require("../../asset/perfume-workshop.jpg"),
      price: "Từ 0đ",
      date: "27 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "oc2",
      title: "Saigon Sake Fest 2025",
      image: require("../../asset/perfume-workshop.jpg"),
      price: "Từ 346.500đ",
      date: "13 tháng 12, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "oc3",
      title: "SOAP HANDMADE WORKSHOP",
      image: require("../../asset/perfume-workshop.jpg"),
      price: "Từ 279.000đ",
      date: "29 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "oc4",
      title: "FANCINE LIÊN BÌNH PHÁT",
      image: require("../../asset/perfume-workshop.jpg"),
      price: "Từ 160.000đ",
      date: "27 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "oc5",
      title: "FANCINE LIÊN BÌNH PHÁT",
      image: require("../../asset/perfume-workshop.jpg"),
      price: "Từ 160.000đ",
      date: "27 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "oc6",
      title: "FANCINE LIÊN BÌNH PHÁT",
      image: require("../../asset/perfume-workshop.jpg"),
      price: "Từ 160.000đ",
      date: "27 tháng 11, 2025",
      description: `Chào mừng cư dân đến với NTPMM Year End 2025...`,
      schedule: [
        {
          dateText: "28 Tháng 11, 2025", // ngày hiển thị ra ngoài
          slots: [
            {
              time: "00:00 - 23:59, T6", // 1 khung giờ trong ngày
              tickets: [
                {
                  name: "Vé trẻ em 3H",
                  price: "290.000 đ",
                },
                {
                  name: "Vé người lớn 3H",
                  price: "500.000 đ",
                },
              ],
            },

            {
              time: "07:00 - 10:00, T6",
              tickets: [
                {
                  name: "Vé thường",
                  price: "150.000 đ",
                },
              ],
            },
          ],
        },

        {
          dateText: "29 Tháng 11, 2025",
          slots: [
            {
              time: "00:00 - 23:59, T7",
              tickets: [
                {
                  name: "Vé tiêu chuẩn",
                  price: "200.000 đ",
                },
              ],
            },
          ],
        },
      ],
    },
  ]),

  featuredDestinations: [
    {
      id: "fd1",
      title: "Tp. Hồ Chí Minh",
      image: require("../../asset/ho-chi-minh-city-skyline.jpg"),
    },
    {
      id: "fd2",
      title: "Hà Nội",
      image: require("../../asset/hanoi-architecture.jpg"),
    },
    {
      id: "fd3",
      title: "Đà Lạt",
      image: require("../../asset/hanoi-architecture.jpg"),
    },
    {
      id: "fd4",
      title: "Vị trí khác",
      image: require("../../asset/nha-trang-observatory-sky.jpg"),
    },
  ],
};
