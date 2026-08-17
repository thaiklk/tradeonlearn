// Khung chủ đề tham khảo từ giáo trình người học cung cấp. Toàn bộ phần diễn giải,
// ví dụ và bài thực hành dưới đây được biên soạn mới cho người mới bắt đầu.

const ACADEMIC_SOURCES = [
  {
    title: 'MIT OpenCourseWare 15.401 Finance Theory I',
    url: 'https://ocw.mit.edu/courses/15-401-finance-theory-i-fall-2008/',
    note: 'Khung chủ đề về báo cáo tài chính, giá trị thời gian, chứng khoán và quyết định đầu tư.',
  },
  {
    title: 'MIT OpenCourseWare 15.402 Finance Theory II',
    url: 'https://ocw.mit.edu/courses/15-402-finance-theory-ii-spring-2003/',
    note: 'Khung chủ đề về tài trợ, định giá, chi phí vốn và phân tích quyết định doanh nghiệp.',
  },
  {
    title: 'NYU Stern Corporate Finance · Aswath Damodaran',
    url: 'https://pages.stern.nyu.edu/~adamodar/New_Home_Page/corpfin.html',
    note: 'Danh mục bài giảng, bài tập và bảng tính dùng để đối chiếu cấu trúc khái niệm.',
  },
]

const SOURCE_NOTE = 'Nội dung tiếng Việt được biên soạn mới theo cấu trúc chủ đề của giáo trình Quản trị Tài chính Doanh nghiệp người học cung cấp và đối chiếu với các nguồn học thuật công khai; không sao chép nguyên văn.'

const field = (id, label, placeholder, help) => ({
  id,
  label,
  placeholder,
  help,
  required: true,
})

const practice = (data) => ({
  minutes: 18,
  ...data,
})

let foundationOrder = 0

const buildFoundationPractice = (data) => {
  const brief = data.tryIt?.text || 'Hoàn thành một workpaper ngắn cho chủ đề này.'
  return practice({
    title: `Workpaper · ${data.title.replace(/^Bài \d+ · /, '')}`,
    objective: `Biến kiến thức về ${data.title.replace(/^Bài \d+ · /, '').toLowerCase()} thành một đầu ra có thể kiểm tra, giải thích và dùng trong trao đổi công việc.`,
    scenario: `Bạn là finance intern hỗ trợ ${data.chapter.toLowerCase()}. Quản lý cần một ghi chú ngắn để kiểm tra giả định và ra quyết định; không chấp nhận câu trả lời chỉ có một con số không có đơn vị hoặc mốc thời gian.`,
    steps: [
      `Thực hiện yêu cầu chính: ${brief}`,
      'Ghi rõ dữ kiện, đơn vị, mốc thời gian và công thức hoặc logic đã dùng.',
      'Viết kết luận bằng lời, nêu một rủi ro/giả định cần kiểm chứng và bước tiếp theo.',
    ],
    fields: [
      field('workpaper', 'Bài làm chính và phép tính/lập luận', `Thực hiện từng phần của yêu cầu: ${brief}`, 'Có thể dùng bảng ngắn, timeline hoặc gạch đầu dòng; ghi đơn vị và dấu tiền.'),
      field('interpretation', 'Diễn giải kết quả cho người không lập file', 'Kết quả có nghĩa gì với doanh nghiệp? Điều gì là dữ kiện và điều gì là giả định?', 'Viết bằng ngôn ngữ quyết định, không chỉ chép lại công thức.'),
      field('recommendation', 'Khuyến nghị và bước kiểm chứng', 'Tôi đề xuất ... vì ...; cần kiểm tra thêm ... trước ngày ...', 'Nêu hành động, owner hoặc dữ liệu cần lấy tiếp theo.'),
    ],
    rubric: [
      'Hoàn thành đúng yêu cầu và dùng số/đơn vị/mốc thời gian nhất quán.',
      'Giải thích được vì sao kết quả quan trọng, không nhầm lợi nhuận với tiền hoặc giả định với dữ kiện.',
      'Có khuyến nghị, rủi ro và bước kiểm chứng cụ thể.',
    ],
    modelAnswer: `Bài làm tốt phải trả lời được yêu cầu “${brief}”, trình bày cách làm đủ để người khác kiểm tra, sau đó kết luận theo bối cảnh doanh nghiệp. Nếu thiếu dữ liệu, hãy nêu rõ giả định thay vì tự biến phỏng đoán thành sự thật.`,
    link: data.tryIt?.link || '/corporate-finance',
  })
}

const lesson = (data) => {
  const courseOrder = ++foundationOrder
  return {
    track: 'Tài chính doanh nghiệp',
    sourceNote: SOURCE_NOTE,
    sources: ACADEMIC_SOURCES,
    ...data,
    id: `tcdn-${data.id}`,
    courseOrder,
    title: `TC DN ${String(courseOrder).padStart(2, '0')} · ${data.title.replace(/^Bài \d+ · /, '')}`,
    practice: data.practice || buildFoundationPractice(data),
  }
}

export const CORPORATE_FINANCE_FOUNDATION_LESSONS = [
  lesson({
    id: 'tai-chinh-doanh-nghiep-la-gi',
    title: 'Bài 1 · Tài chính doanh nghiệp là gì?',
    level: 'Nền tảng',
    minutes: 22,
    chapter: 'Chương 1 · Nhập môn quản trị tài chính doanh nghiệp',
    summary: 'Hiểu tài chính doanh nghiệp là công việc biến nguồn lực hôm nay thành giá trị bền vững trong tương lai, thay vì chỉ là ghi chép tiền thu và tiền chi.',
    sections: [
      {
        h: '1. Nhìn doanh nghiệp như một cỗ máy tạo tiền',
        p: [
          'Một doanh nghiệp nhận tiền từ người góp vốn và người cho vay, dùng tiền mua tài sản, tuyển người, sản xuất hoặc cung cấp dịch vụ, rồi thu tiền từ khách hàng. Tài chính doanh nghiệp theo dõi xem vòng quay đó có tạo ra nhiều tiền hơn chi phí bỏ ra hay không.',
          'Kế toán ghi nhận và chuẩn hóa các giao dịch đã xảy ra. Quản trị tài chính dùng các dữ liệu đó để trả lời câu hỏi hướng về phía trước: nên đầu tư bao nhiêu, lấy vốn ở đâu, và có đủ tiền để vận hành trước khi khách hàng thanh toán không.'
        ],
        tip: 'Đừng đồng nhất “có tiền trong tài khoản” với “kinh doanh có lãi”. Một công ty có thể đang có nhiều tiền nhờ vay thêm, dù hoạt động cốt lõi vẫn lỗ.'
      },
      {
        h: '2. Ba quyết định lớn của người làm tài chính',
        p: [
          'Mọi vị trí từ finance intern đến CFO đều quay lại ba nhóm quyết định. Chúng liên kết với nhau: quyết định đầu tư tạo nhu cầu vốn; cách huy động vốn làm phát sinh chi phí; chính sách tiền mặt quyết định doanh nghiệp có sống đủ lâu để thu được lợi ích từ đầu tư hay không.'
        ],
        list: [
          'Đầu tư: có mua máy đóng gói giá 2 tỷ đồng, mở thêm cửa hàng, xây phần mềm hay mua lại một doanh nghiệp khác không?',
          'Tài trợ: dùng lợi nhuận giữ lại, vay ngân hàng, thuê tài sản, phát hành cổ phần hay kéo dài thời hạn thanh toán nhà cung cấp?',
          'Vận hành tiền: tồn kho bao nhiêu, bán chịu bao lâu, giữ bao nhiêu tiền dự phòng và trả nợ khi nào?'
        ]
      },
      {
        h: '3. Ví dụ từ một quán cà phê nhỏ',
        p: [
          'Giả sử quán cần 300 triệu đồng để sửa mặt bằng, mua máy pha và nhập nguyên liệu. Nếu dự kiến mỗi tháng thu được 90 triệu, chi tiền nguyên liệu, lương và thuê nhà là 72 triệu, quán còn 18 triệu trước các khoản khác. Người làm tài chính chưa thể kết luận dự án tốt chỉ vì con số 18 triệu dương.',
          'Họ cần hỏi tiếp: 300 triệu được bỏ ra một lần hay theo đợt? Khách trả ngay hay cuối tháng? Máy dùng được bao lâu? Lãi vay là bao nhiêu? Sau khi tính đủ dòng tiền và rủi ro, lợi ích có đáng so với việc đem 300 triệu đi làm lựa chọn khác không?'
        ],
        tip: 'Tập biến mỗi ý tưởng kinh doanh thành bốn ô: tiền bỏ ra ban đầu, tiền thu vào, tiền chi ra, thời điểm phát sinh. Bốn ô này là hạt giống của mọi mô hình tài chính.'
      },
      {
        h: '4. Công việc thực tế của người mới đi làm',
        p: [
          'Ở doanh nghiệp, bạn có thể lập ngân sách, đối chiếu số thực tế với kế hoạch, chuẩn bị báo cáo dòng tiền tuần, tính hiệu quả một chương trình khuyến mãi, rà soát đề nghị mua tài sản hoặc viết ghi chú cho quản lý. Giá trị của bạn không nằm ở việc tạo bảng tính thật đẹp mà ở việc làm rõ quyết định và giả định phía sau nó.'
        ],
        list: [
          'FP&A: dự báo doanh thu, chi phí, lợi nhuận và giải thích chênh lệch với kế hoạch.',
          'Treasury: theo dõi số dư, lịch thu chi, khoản vay và rủi ro thanh khoản.',
          'Corporate finance: thẩm định dự án, huy động vốn, định giá và hỗ trợ quyết định dài hạn.'
        ]
      }
    ],
    keyPoints: [
      'Tài chính doanh nghiệp nhìn về quyết định tương lai, không chỉ ghi nhận quá khứ.',
      'Ba trụ cột là đầu tư, tài trợ và quản trị tiền/vốn lưu động.',
      'Lợi nhuận, tiền mặt và giá trị doanh nghiệp là ba khái niệm khác nhau.',
      'Mọi đề xuất tài chính tốt đều nêu số tiền, thời điểm, rủi ro và lựa chọn thay thế.'
    ],
    relatedTerms: ['Quản trị tài chính', 'Đầu tư vốn', 'Nguồn tài trợ', 'Vốn lưu động', 'Dòng tiền'],
    tryIt: { text: 'Chọn một doanh nghiệp quen thuộc và phác bốn ô: tiền đầu tư ban đầu, nguồn thu, khoản chi và thời điểm thu tiền.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'muc-tieu-va-xung-dot-loi-ich',
    title: 'Bài 2 · Mục tiêu giá trị và các xung đột lợi ích',
    level: 'Nền tảng',
    minutes: 24,
    chapter: 'Chương 1 · Nhập môn quản trị tài chính doanh nghiệp',
    summary: 'Học cách phân biệt doanh thu, lợi nhuận kế toán và giá trị doanh nghiệp; đồng thời nhận diện các xung đột lợi ích khiến một quyết định “đẹp số” có thể không tốt về dài hạn.',
    sections: [
      {
        h: '1. Vì sao không lấy doanh thu làm đích đến?',
        p: [
          'Doanh thu cho biết khách hàng đã mua bao nhiêu, nhưng không nói chi phí để có doanh thu đó. Một cửa hàng tăng doanh thu từ 1 tỷ lên 1,3 tỷ đồng có thể đang giảm giá quá sâu, quảng cáo quá nhiều hoặc bán chịu cho khách khó đòi. Khi đó doanh thu tăng nhưng tiền và lợi nhuận có thể xấu đi.',
          'Lợi nhuận sau thuế tốt hơn doanh thu vì đã trừ nhiều loại chi phí, nhưng vẫn phụ thuộc vào thời điểm ghi nhận và ước tính kế toán. Giá trị doanh nghiệp là giá trị hiện tại của các dòng tiền mà doanh nghiệp có thể tạo ra cho người cấp vốn trong tương lai, có điều chỉnh theo rủi ro.'
        ],
        tip: 'Khi nghe một mục tiêu “tăng X%”, hãy hỏi ngay: tăng doanh thu, lợi nhuận, dòng tiền hay giá trị? Bốn câu trả lời sẽ dẫn đến bốn cách hành động khác nhau.'
      },
      {
        h: '2. Giá trị đến từ dòng tiền bền vững',
        p: [
          'Một dự án tạo 100 triệu đồng tiền mặt mỗi năm trong 5 năm không tự động có giá trị 500 triệu. Tiền năm sau có giá trị thấp hơn tiền hôm nay và dòng tiền không chắc chắn. Vì vậy người làm tài chính chiết khấu từng khoản tiền tương lai về hiện tại bằng một tỷ lệ phản ánh chi phí cơ hội và rủi ro.',
          'Ví dụ, hai phương án cùng lời kế toán 80 triệu đồng. Phương án A thu tiền ngay trong năm đầu; phương án B chỉ thu vào năm thứ năm. Nếu rủi ro tương tự, A thường đáng giá hơn vì doanh nghiệp có thể dùng tiền sớm hơn để trả nợ hoặc tái đầu tư.'
        ],
        list: [
          'Tăng dòng tiền: cải thiện sản phẩm, giá bán, năng suất hoặc vòng quay vốn.',
          'Giảm rủi ro: ký hợp đồng dài hơn, đa dạng khách hàng, kiểm soát nợ phải thu.',
          'Không hy sinh tương lai cho chỉ tiêu ngắn hạn nếu lợi ích thật không bù được chi phí.'
        ]
      },
      {
        h: '3. Xung đột giữa chủ sở hữu và người điều hành',
        p: [
          'Chủ sở hữu muốn giá trị dài hạn tăng; người điều hành đôi khi chịu áp lực thưởng theo doanh thu hoặc lợi nhuận quý. Điều này có thể dẫn đến bán hàng bằng mọi giá, trì hoãn chi phí cần thiết, đầu tư dự án lớn để tăng quy mô cá nhân hoặc chọn dự án an toàn quá mức để giữ vị trí.',
          'Đây không có nghĩa mọi quản lý đều hành động xấu. Đây là một rủi ro thiết kế hệ thống. Doanh nghiệp giảm rủi ro bằng mục tiêu cân bằng, phê duyệt độc lập, báo cáo minh bạch, kiểm toán, quyền giám sát và cơ chế thưởng gắn với kết quả dài hạn.'
        ],
        tip: 'Trong một báo cáo, hãy ghi rõ ai được lợi, ai chịu rủi ro và số liệu nào có thể bị thiên lệch. Đây là thói quen phân tích hữu ích hơn việc chỉ lặp lại số tổng.'
      },
      {
        h: '4. Trách nhiệm với các bên liên quan',
        p: [
          'Tối đa hóa giá trị không phải giấy phép để bỏ qua pháp luật, an toàn lao động, khách hàng hay môi trường. Phạt vi phạm, mất giấy phép, mất nhân sự giỏi và suy giảm thương hiệu đều là chi phí kinh tế thật. Một quyết định bền vững phải đánh giá cả dòng tiền, rủi ro tuân thủ và niềm tin dài hạn.',
          'Ví dụ, giảm chi phí bằng cách dùng vật liệu không đạt chuẩn có thể làm biên lợi nhuận quý này đẹp hơn. Nhưng nếu sản phẩm bị thu hồi, doanh nghiệp mất tiền bồi thường, doanh thu tương lai và khả năng huy động vốn. Người làm tài chính cần đưa các chi phí đó vào phân tích thay vì gọi chúng là “chuyện của bộ phận khác”.'
        ],
        list: [
          'Câu hỏi kiểm tra: quyết định có hợp pháp và có thể giải thích công khai không?',
          'Chi phí bị trì hoãn hôm nay có thể quay lại dưới dạng khoản phải trả lớn hơn ngày mai không?',
          'Chỉ tiêu thưởng có khuyến khích hành vi tạo giá trị dài hạn không?'
        ]
      }
    ],
    keyPoints: [
      'Doanh thu và lợi nhuận không tự động đồng nghĩa với giá trị.',
      'Giá trị gắn với dòng tiền tương lai, thời điểm nhận tiền và mức rủi ro.',
      'Xung đột lợi ích là vấn đề thiết kế động lực và kiểm soát, không chỉ là vấn đề đạo đức cá nhân.',
      'Tuân thủ và uy tín là một phần của phân tích tài chính dài hạn.'
    ],
    relatedTerms: ['Giá trị doanh nghiệp', 'Chiết khấu dòng tiền', 'Lý thuyết người đại diện', 'Bên liên quan', 'Quản trị doanh nghiệp'],
    tryIt: { text: 'Viết lại mục tiêu “tăng doanh thu” thành một mục tiêu cân bằng có điều kiện về biên lợi nhuận, thu tiền và rủi ro.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'ban-do-cong-viec-tai-chinh-doanh-nghiep',
    title: 'Bài 3 · Bản đồ doanh nghiệp và công việc tài chính',
    level: 'Nền tảng',
    minutes: 20,
    chapter: 'Chương 1 · Nhập môn quản trị tài chính doanh nghiệp',
    summary: 'Biết doanh nghiệp được tổ chức ra sao, tài chính nhận dữ liệu từ đâu và cách một sinh viên mới có thể đóng góp bằng những đầu ra rõ ràng.',
    sections: [
      {
        h: '1. Hình thức doanh nghiệp ảnh hưởng đến quyết định',
        p: [
          'Hộ kinh doanh, công ty trách nhiệm hữu hạn và công ty cổ phần đều tạo doanh thu và chi phí, nhưng khác nhau về chủ sở hữu, khả năng huy động vốn và trách nhiệm pháp lý. Công ty cổ phần có thể có nhiều cổ đông và tách quyền sở hữu khỏi điều hành; vì vậy yêu cầu báo cáo, quản trị và kiểm soát thường phức tạp hơn.',
          'Dù làm ở loại hình nào, bạn cần biết ai có quyền phê duyệt ngân sách, ai ký hợp đồng, ai sở hữu dữ liệu bán hàng và ai chịu trách nhiệm thu tiền. Nếu không rõ quyền hạn, một bảng phân tích tốt cũng có thể không được dùng để ra quyết định.'
        ],
        tip: 'Trước khi phân tích, hãy hỏi: quyết định này do ai sở hữu, thời hạn ra quyết định là khi nào và họ cần kết luận gì từ dữ liệu của mình?'
      },
      {
        h: '2. Dòng dữ liệu đi qua các bộ phận',
        p: [
          'Bán hàng biết đơn hàng, giá và khách hàng. Vận hành biết sản lượng, hao hụt và công suất. Mua hàng biết giá đầu vào, tồn kho và điều khoản nhà cung cấp. Kế toán ghi nhận chứng từ. Tài chính kết nối các mảnh này để dự báo kết quả và cảnh báo điểm ra quyết định.',
          'Ví dụ, doanh thu tháng này thấp hơn kế hoạch 200 triệu không phải là kết luận cuối. Finance phải tách số thiếu hụt do sản lượng, giá bán, cơ cấu sản phẩm, thời điểm giao hàng hay tỷ giá; sau đó chuyển phân tích thành hành động phù hợp với từng bộ phận.'
        ],
        list: [
          'Dữ liệu đầu vào: đơn hàng, hóa đơn, bảng lương, tồn kho, hợp đồng vay, kế hoạch sản xuất.',
          'Xử lý: chuẩn hóa kỳ, đơn vị, mã sản phẩm và đối chiếu nguồn số liệu.',
          'Đầu ra: forecast, báo cáo chênh lệch, đề xuất vốn, lịch tiền và memo quyết định.'
        ]
      },
      {
        h: '3. Chu kỳ làm việc của FP&A',
        p: [
          'Một chu kỳ điển hình gồm lập kế hoạch năm, cập nhật forecast theo tháng hoặc quý, chốt số thực tế, giải thích chênh lệch và điều chỉnh hành động. Người mới thường bắt đầu bằng việc kiểm tra số, cập nhật file, hỏi chủ dữ liệu và chuẩn bị bảng tóm tắt cho người quản lý.',
          'Chất lượng không nằm ở việc “đúng đến từng đồng” ngay từ lần đầu. Nó nằm ở tính truy vết: người đọc biết số đến từ đâu, giả định nào thay đổi, phần nào chưa xác nhận và điều gì sẽ làm forecast sai.'
        ],
        tip: 'Một forecast có ích luôn có ngày cập nhật, người chịu trách nhiệm, đơn vị đo, kỳ thời gian và giả định chính. Thiếu một trong năm thứ này, forecast rất dễ bị hiểu sai.'
      },
      {
        h: '4. Bộ kỹ năng cần xây từ hôm nay',
        p: [
          'Bạn không cần thuộc mọi công thức để bắt đầu. Hãy rèn ba tầng: đọc đúng số, giải thích nguyên nhân và đưa ra bước tiếp theo. Excel hoặc Google Sheets, tư duy dữ liệu, viết ngắn gọn và trao đổi với bộ phận vận hành quan trọng ngang với kiến thức công thức.',
          'Một đầu ra tốt cho cấp quản lý thường chỉ gồm: kết luận một câu, ba số quan trọng, nguyên nhân đã xác nhận, rủi ro còn mở và hành động/owner tiếp theo. Các bảng chi tiết vẫn cần giữ để kiểm tra, nhưng không nên che mất kết luận.'
        ],
        list: [
          'Kỹ năng số: SUMIFS, XLOOKUP, PivotTable, kiểm tra dấu âm/dương và liên kết bảng.',
          'Kỹ năng phân tích: phân rã chênh lệch, đánh giá giả định, phân biệt dữ kiện với suy đoán.',
          'Kỹ năng giao tiếp: hỏi đúng người, nêu rõ deadline và viết kết luận trước khi gửi số.'
        ]
      }
    ],
    keyPoints: [
      'Tài chính là cầu nối giữa dữ liệu vận hành và quyết định quản trị.',
      'Biết người ra quyết định và deadline trước khi bắt đầu phân tích.',
      'Chu kỳ FP&A: kế hoạch, forecast, actual, giải thích chênh lệch, hành động.',
      'Đầu ra cần truy vết được nguồn, kỳ, đơn vị và giả định.'
    ],
    relatedTerms: ['FP&A', 'Forecast', 'Actual', 'Budget', 'Variance', 'Owner'],
    tryIt: { text: 'Vẽ sơ đồ một trang về doanh nghiệp bạn chọn: bán hàng, vận hành, kế toán, tài chính và một dữ liệu mà mỗi bộ phận tạo ra.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'doc-bang-can-doi-ke-toan',
    title: 'Bài 4 · Đọc bảng cân đối kế toán từ con số 0',
    level: 'Cơ bản',
    minutes: 28,
    chapter: 'Chương 2 · Các báo cáo tài chính',
    summary: 'Đọc được doanh nghiệp đang sở hữu gì, đang nợ ai và phần nào thuộc về chủ sở hữu; từ đó thấy được cấu trúc tài sản, thanh khoản và áp lực nợ.',
    sections: [
      {
        h: '1. Phương trình nền tảng',
        p: [
          'Bảng cân đối kế toán là ảnh chụp tại một thời điểm, ví dụ ngày 31/12. Nó luôn tuân theo phương trình: Tài sản = Nợ phải trả + Vốn chủ sở hữu. Nếu doanh nghiệp có tài sản 1.000 triệu đồng và nợ 600 triệu đồng, phần vốn còn lại của chủ sở hữu là 400 triệu đồng.',
          'Đây không phải công thức để học thuộc mà là cơ chế kiểm tra logic. Mỗi giao dịch phải tác động ít nhất hai bên: vay ngân hàng 100 triệu làm tiền tăng 100 và nợ tăng 100; mua máy bằng tiền làm máy tăng và tiền giảm, tổng tài sản chưa đổi.'
        ],
        tip: 'Bảng cân đối chỉ là ảnh tại một ngày. Để hiểu xu hướng, hãy luôn so ít nhất hai kỳ và hỏi điều gì khiến từng khoản mục tăng hoặc giảm.'
      },
      {
        h: '2. Tài sản: nguồn lực nào sẽ biến thành tiền?',
        p: [
          'Tài sản ngắn hạn thường được kỳ vọng chuyển thành tiền hoặc dùng trong chu kỳ kinh doanh dưới một năm: tiền, đầu tư ngắn hạn, phải thu, tồn kho. Tài sản dài hạn gồm nhà xưởng, máy móc, phần mềm, quyền sử dụng hoặc khoản đầu tư dài hạn.',
          'Không phải tài sản nào ghi sổ cao cũng dễ chuyển thành tiền. Tồn kho lỗi mốt có thể phải giảm giá mới bán được; một máy chuyên dụng có thể khó thanh lý. Vì vậy khi phân tích, chất lượng và tốc độ chuyển đổi của tài sản quan trọng hơn tổng số tuyệt đối.'
        ],
        list: [
          'Tiền và tương đương tiền: khả năng chi ngay, nhưng cũng cần xem tiền có bị hạn chế sử dụng không.',
          'Phải thu: khách hàng đã nhận hàng/dịch vụ nhưng chưa thanh toán.',
          'Tồn kho: nguyên vật liệu, sản phẩm dở dang hoặc hàng hóa chờ bán.',
          'Tài sản cố định: nguồn lực phục vụ nhiều kỳ, được phân bổ chi phí dần qua khấu hao.'
        ]
      },
      {
        h: '3. Nợ phải trả và vốn chủ sở hữu',
        p: [
          'Nợ phải trả là nghĩa vụ doanh nghiệp phải giao tiền, hàng hoặc dịch vụ trong tương lai. Nợ ngắn hạn đến hạn sớm như phải trả nhà cung cấp, lương phải trả và vay ngắn hạn; nợ dài hạn như khoản vay nhiều năm hoặc trái phiếu. Thời hạn quan trọng vì nó quyết định áp lực tiền mặt.',
          'Vốn chủ sở hữu gồm vốn góp, lợi nhuận giữ lại và một số khoản điều chỉnh tùy chuẩn mực. Vốn chủ không phải “tiền mặt của chủ” mà là phần giá trị còn lại theo sổ sách sau khi trừ nợ. Nó có thể tăng khi có lãi giữ lại hoặc chủ góp thêm vốn.'
        ],
        tip: 'Một công ty có nợ cao chưa chắc xấu. Hãy so thời hạn nợ, lãi suất, dòng tiền trả nợ và độ ổn định của hoạt động trước khi kết luận.'
      },
      {
        h: '4. Cách đọc một bảng cân đối có mục đích',
        p: [
          'Bắt đầu bằng ba câu hỏi: tiền và tài sản ngắn hạn có đủ đáp ứng nghĩa vụ ngắn hạn không; tài sản tăng do đầu tư có sinh lợi hay do tiền bị mắc ở tồn kho/phải thu; nguồn vốn có phù hợp với vòng đời tài sản không. Ví dụ, dùng vay ba tháng để mua máy sử dụng năm năm tạo ra rủi ro tái cấp vốn.',
          'Sau đó nối với báo cáo kết quả kinh doanh và lưu chuyển tiền. Phải thu tăng 150 triệu có thể đi cùng doanh thu tăng, nhưng nếu tiền thu từ khách hàng không tăng tương ứng thì đây là điểm cần điều tra về chính sách tín dụng hoặc chất lượng khách hàng.'
        ],
        list: [
          'So sánh tỷ trọng từng khoản trên tổng tài sản và trên doanh thu.',
          'Đối chiếu số đầu kỳ, phát sinh và cuối kỳ đối với khoản biến động lớn.',
          'Đọc thuyết minh để biết kỳ hạn vay, tài sản thế chấp, tuổi nợ phải thu và chính sách tồn kho.'
        ]
      }
    ],
    keyPoints: [
      'Tài sản = Nợ phải trả + Vốn chủ sở hữu luôn phải cân bằng.',
      'Bảng cân đối là ảnh tại một thời điểm, cần so sánh qua các kỳ.',
      'Chất lượng và khả năng chuyển thành tiền của tài sản quan trọng hơn quy mô ghi sổ.',
      'Hãy ghép kỳ hạn nguồn vốn với thời gian thu hồi của tài sản.'
    ],
    relatedTerms: ['Tài sản', 'Nợ phải trả', 'Vốn chủ sở hữu', 'Phải thu', 'Tồn kho', 'Tài sản cố định'],
    tryIt: { text: 'Lập phương trình tài sản = nợ + vốn chủ cho một quán nhỏ có tiền 80, tồn kho 40, máy 180 và vay ngân hàng 150.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'doc-bao-cao-ket-qua-kinh-doanh',
    title: 'Bài 5 · Đọc báo cáo kết quả kinh doanh và biên lợi nhuận',
    level: 'Cơ bản',
    minutes: 26,
    chapter: 'Chương 2 · Các báo cáo tài chính',
    summary: 'Biết đọc con đường từ doanh thu đến lợi nhuận, tách biến động giá/sản lượng/cơ cấu và không nhầm lợi nhuận kế toán với tiền thật.',
    sections: [
      {
        h: '1. Báo cáo hoạt động trong một khoảng thời gian',
        p: [
          'Khác với bảng cân đối là ảnh tại ngày cuối kỳ, báo cáo kết quả kinh doanh đo thành quả trong một khoảng thời gian như tháng hoặc năm. Cấu trúc cơ bản là doanh thu trừ giá vốn hàng bán, chi phí vận hành, chi phí lãi vay và thuế để ra lợi nhuận sau thuế.',
          'Ví dụ, doanh thu 1.000 triệu, giá vốn 600 triệu thì lợi nhuận gộp là 400 triệu. Nếu chi phí bán hàng và quản lý là 250 triệu, lợi nhuận từ hoạt động là 150 triệu trước các khoản khác. Số liệu chỉ có ích khi bạn biết điều gì đã tạo ra thay đổi so với kỳ trước hoặc kế hoạch.'
        ],
        tip: 'Luôn viết rõ đơn vị và kỳ: “triệu đồng, tháng 6” khác hoàn toàn với “tỷ đồng, lũy kế 6 tháng”. Sai đơn vị là lỗi nhỏ nhưng có thể làm quyết định sai rất lớn.'
      },
      {
        h: '2. Ba tầng lợi nhuận cần theo dõi',
        p: [
          'Lợi nhuận gộp cho thấy hoạt động bán sản phẩm/dịch vụ sau chi phí trực tiếp có đủ khỏe không. Lợi nhuận từ hoạt động cho thấy sau chi phí vận hành như marketing, lương văn phòng và khấu hao, mô hình vẫn tạo lợi nhuận. Lợi nhuận sau thuế còn chịu ảnh hưởng của lãi vay, thuế và khoản bất thường.',
          'Một công ty có thể báo lãi ròng tăng do bán tài sản một lần, trong khi lợi nhuận hoạt động giảm. Vì vậy phân tích tốt không chỉ nhìn dòng cuối cùng mà phải đi ngược lên tìm chất lượng nguồn lợi nhuận.'
        ],
        list: [
          'Biên gộp = lợi nhuận gộp / doanh thu: phản ánh giá bán, giá đầu vào và cơ cấu sản phẩm.',
          'Biên hoạt động = lợi nhuận từ hoạt động / doanh thu: phản ánh hiệu quả sau chi phí vận hành.',
          'Biên ròng = lợi nhuận sau thuế / doanh thu: kết quả cuối sau tài chính và thuế.'
        ]
      },
      {
        h: '3. Phân rã doanh thu và chi phí',
        p: [
          'Doanh thu thường được phân tích thành giá bán nhân sản lượng, rồi tách thêm theo sản phẩm, kênh hoặc khu vực. Nếu doanh thu tăng 10%, hãy kiểm tra 10% đó đến từ bán nhiều hơn, tăng giá, thay đổi cơ cấu hay ghi nhận khác kỳ. Mỗi nguyên nhân đòi hỏi hành động khác nhau.',
          'Với chi phí, đừng chỉ kết luận “tăng 20%”. Phân biệt chi phí biến đổi theo doanh thu với chi phí cố định, chi phí một lần với chi phí lặp lại. Ví dụ, phí vận chuyển tăng cùng sản lượng có thể bình thường; lương thuê ngoài tăng dù sản lượng giảm lại cần giải thích kỹ hơn.'
        ],
        tip: 'Một chênh lệch tốt phải có cầu nối: “doanh thu thấp hơn kế hoạch 100 triệu do sản lượng -70, giá -20, cơ cấu -10”. Cầu nối biến con số thành cuộc đối thoại vận hành.'
      },
      {
        h: '4. Những bẫy khi đọc lợi nhuận',
        p: [
          'Lợi nhuận được ghi nhận theo nguyên tắc kế toán, nên chưa chắc tiền đã thu. Bán chịu có thể làm doanh thu và lợi nhuận tăng trong khi phải thu phình to. Khấu hao làm lợi nhuận giảm nhưng không phải tiền chi ngay trong kỳ. Ngược lại, mua máy làm tiền giảm ngay nhưng chi phí được phân bổ dần.',
          'Khi thấy lợi nhuận biến động, kiểm tra các khoản không lặp lại, chính sách ghi nhận, khoản dự phòng, lãi/lỗ tỷ giá và tiến độ thu tiền. Không cần nghi ngờ mọi số liệu, nhưng cần biết đâu là phần hoạt động có thể lặp lại.'
        ],
        list: [
          'So sánh cùng kỳ năm trước để giảm ảnh hưởng mùa vụ.',
          'Tách số thực tế với ngân sách/forecast để phục vụ hành động hiện tại.',
          'Liên kết lợi nhuận với dòng tiền hoạt động trước khi đánh giá chất lượng.'
        ]
      }
    ],
    keyPoints: [
      'Báo cáo kết quả kinh doanh đo hiệu quả trong một khoảng thời gian.',
      'Theo dõi cả biên gộp, biên hoạt động và biên ròng.',
      'Chênh lệch doanh thu nên được phân rã theo giá, sản lượng và cơ cấu.',
      'Lợi nhuận không đồng nghĩa với tiền đã thu.'
    ],
    relatedTerms: ['Doanh thu', 'Giá vốn', 'Lợi nhuận gộp', 'EBIT', 'Biên lợi nhuận', 'Chi phí cố định'],
    tryIt: { text: 'Từ doanh thu 1.200, giá vốn 780 và chi phí vận hành 300 triệu, tính ba mức lợi nhuận và viết một câu về biên hoạt động.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'doc-bao-cao-luu-chuyen-tien-te',
    title: 'Bài 6 · Đọc báo cáo lưu chuyển tiền tệ',
    level: 'Cơ bản',
    minutes: 28,
    chapter: 'Chương 2 · Các báo cáo tài chính',
    summary: 'Hiểu tiền đi vào và đi ra từ hoạt động, đầu tư và tài trợ; biết tại sao một công ty có lãi vẫn có thể thiếu tiền.',
    sections: [
      {
        h: '1. Ba luồng tiền trả lời ba câu hỏi',
        p: [
          'Báo cáo lưu chuyển tiền tệ giải thích vì sao số dư tiền đầu kỳ biến thành số dư tiền cuối kỳ. Luồng tiền từ hoạt động kinh doanh trả lời công việc cốt lõi có tạo tiền không. Luồng tiền đầu tư cho biết doanh nghiệp mua/bán tài sản dài hạn hay đầu tư khác. Luồng tiền tài trợ cho biết tiền đến từ hoặc trả cho chủ nợ và chủ sở hữu.',
          'Ví dụ, công ty có lợi nhuận sau thuế 100 triệu nhưng phải thu tăng 70 và tồn kho tăng 50. Nếu bỏ qua các điều chỉnh khác, hoạt động có thể làm tiền giảm 20 triệu. Đây là lý do người quản lý tiền không được chỉ nhìn lợi nhuận.'
        ],
        tip: 'Hãy luôn kiểm tra phép nối: tiền đầu kỳ + CFO + CFI + CFF = tiền cuối kỳ. Nếu không nối được, bạn chưa hiểu báo cáo.'
      },
      {
        h: '2. Luồng tiền từ hoạt động kinh doanh',
        p: [
          'Theo cách gián tiếp thường gặp, báo cáo bắt đầu từ lợi nhuận rồi cộng lại chi phí không dùng tiền như khấu hao, sau đó điều chỉnh biến động vốn lưu động. Phải thu tăng hoặc tồn kho tăng thường làm giảm tiền; phải trả nhà cung cấp tăng thường tạm thời giữ lại tiền.',
          'CFO dương ổn định thường là tín hiệu tốt, nhưng không nên thần thánh hóa một kỳ. CFO âm có thể là kết quả của tăng trưởng lành mạnh khi công ty tích trữ hàng hoặc mở rộng bán chịu; điều cần biết là tính tạm thời, lý do và khả năng thu hồi tiền sau đó.'
        ],
        list: [
          'Lợi nhuận: xuất phát điểm theo kế toán.',
          'Cộng lại: khấu hao và các chi phí không tiền mặt phù hợp.',
          'Trừ/cộng vốn lưu động: thay đổi phải thu, tồn kho, phải trả và khoản hoạt động khác.'
        ]
      },
      {
        h: '3. Luồng tiền đầu tư và tài trợ',
        p: [
          'Mua máy, xây nhà xưởng hoặc mua phần mềm thường xuất hiện là dòng tiền đầu tư âm vì tiền đã chi ra. Điều này không xấu nếu tài sản tạo dòng tiền tốt hơn trong tương lai. Bán tài sản tạo tiền vào nhưng cũng cần xem đó là tái cơ cấu hợp lý hay bán tài sản để chữa thiếu tiền.',
          'Vay mới, phát hành cổ phần tạo dòng tiền tài trợ dương; trả nợ, trả cổ tức, mua lại cổ phần tạo dòng tiền âm. Đọc CFF giúp bạn biết tăng tiền mặt do hoạt động mạnh hay do phụ thuộc vào cấp vốn mới.'
        ],
        tip: 'Đừng kết luận “CFI âm là xấu” hay “CFF dương là tốt”. Câu hỏi đúng là: tiền này tài trợ cho tài sản nào, khi nào tài sản tạo tiền, và nguồn vốn có bền vững không?'
      },
      {
        h: '4. Chất lượng lợi nhuận và dòng tiền tự do',
        p: [
          'So sánh CFO với lợi nhuận sau thuế qua nhiều kỳ. Nếu lợi nhuận tăng liên tục còn CFO tụt lại, nguyên nhân có thể nằm ở phải thu, tồn kho hoặc khoản ghi nhận khác. Đây là tín hiệu để đọc thuyết minh, không phải bằng chứng tự động của sai phạm.',
          'Một thước đo khái quát là dòng tiền tự do trước tài trợ: CFO trừ chi đầu tư cần thiết. Nó cho biết sau khi duy trì hoặc mở rộng năng lực hoạt động, doanh nghiệp còn bao nhiêu tiền để trả nợ, trả cổ đông hay đầu tư tiếp. Cần phân biệt chi đầu tư duy trì với đầu tư tăng trưởng nếu có thể.'
        ],
        list: [
          'Đọc tối thiểu ba năm hoặc nhiều quý để nhận biết xu hướng.',
          'Đối chiếu CFO với doanh thu, lợi nhuận và biến động vốn lưu động.',
          'Xem lịch trả nợ cùng với số dư tiền, không chỉ nhìn tổng tiền cuối kỳ.'
        ]
      }
    ],
    keyPoints: [
      'CFO, CFI và CFF giải thích thay đổi tiền mặt từ ba nguồn khác nhau.',
      'Tăng phải thu và tồn kho thường hút tiền khỏi hoạt động.',
      'Có lãi không đảm bảo có tiền để trả nợ hoặc chi trả đúng hạn.',
      'So sánh nhiều kỳ trước khi kết luận về chất lượng dòng tiền.'
    ],
    relatedTerms: ['CFO', 'CFI', 'CFF', 'Dòng tiền tự do', 'Vốn lưu động', 'Khấu hao'],
    tryIt: { text: 'Tính thay đổi tiền khi CFO là 60, CFI là -90, CFF là 50 triệu và tiền đầu kỳ là 30 triệu.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'ket-noi-ba-bao-cao-tai-chinh',
    title: 'Bài 7 · Kết nối ba báo cáo tài chính',
    level: 'Cơ bản',
    minutes: 30,
    chapter: 'Chương 2 · Các báo cáo tài chính',
    summary: 'Biết một giao dịch đi qua bảng cân đối, báo cáo kết quả kinh doanh và lưu chuyển tiền như thế nào; đây là nền để lập forecast và kiểm tra mô hình.',
    sections: [
      {
        h: '1. Ba báo cáo là một câu chuyện, không phải ba bảng rời',
        p: [
          'Báo cáo kết quả kinh doanh tạo ra lợi nhuận hoặc lỗ trong kỳ. Lợi nhuận sau thuế làm thay đổi lợi nhuận giữ lại trong vốn chủ sở hữu trên bảng cân đối. Báo cáo lưu chuyển tiền giải thích phần chênh giữa lợi nhuận và thay đổi tiền, rồi số tiền cuối kỳ quay lại bảng cân đối.',
          'Nếu một mô hình có ba báo cáo mà tiền cuối kỳ ở báo cáo lưu chuyển tiền khác với tiền trên bảng cân đối, mô hình đang sai. Kiểm tra liên kết là cách nhanh nhất để tìm lỗi công thức, thiếu khoản mục hoặc đảo dấu.'
        ],
        tip: 'Ba điểm nối tối thiểu: lợi nhuận sau thuế sang lợi nhuận giữ lại, khấu hao từ kết quả kinh doanh sang CFO và giảm giá trị tài sản, tiền cuối kỳ sang bảng cân đối.'
      },
      {
        h: '2. Ví dụ: bán hàng chịu 120 triệu',
        p: [
          'Giả sử doanh nghiệp bán hàng giá 120 triệu, giá vốn 70 triệu, khách chưa thanh toán. Trên báo cáo kết quả, doanh thu tăng 120, giá vốn tăng 70, lợi nhuận trước thuế tăng 50. Trên bảng cân đối, phải thu tăng 120 và tồn kho giảm 70; vốn chủ sở hữu sẽ tăng theo lợi nhuận sau thuế sau khi ghi nhận thuế.',
          'Trên lưu chuyển tiền, chưa có tiền thu từ khách. Khi lập CFO theo cách gián tiếp, phần tăng phải thu 120 sẽ được trừ ra khỏi lợi nhuận điều chỉnh. Điều này giải thích tại sao một giao dịch có lãi có thể chưa tạo tiền mặt trong kỳ.'
        ],
        list: [
          'Kết quả kinh doanh: phản ánh doanh thu và chi phí theo kỳ.',
          'Bảng cân đối: phản ánh quyền đòi tiền và hàng đã giảm.',
          'Lưu chuyển tiền: điều chỉnh để loại phần doanh thu chưa thu bằng tiền.'
        ]
      },
      {
        h: '3. Ví dụ: mua máy bằng khoản vay',
        p: [
          'Mua máy 200 triệu bằng tiền vay làm tài sản cố định tăng 200 và nợ vay tăng 200 tại thời điểm mua. Trên lưu chuyển tiền, vay mới là CFF dương 200 và mua máy là CFI âm 200, nên thay đổi tiền ròng ngay lúc đó bằng 0.',
          'Sau đó máy được khấu hao, ví dụ 40 triệu mỗi năm. Khấu hao làm chi phí tăng trên báo cáo kết quả và làm giá trị sổ sách của máy giảm trên bảng cân đối, nhưng không làm tiền năm đó giảm thêm. Vì đã giảm lợi nhuận mà không chi tiền, khấu hao được cộng lại trong CFO.'
        ],
        tip: 'Một lỗi phổ biến là cho cả chi mua máy và khấu hao cùng làm giảm CFO. Chi mua máy thuộc CFI; khấu hao chỉ là chi phí kế toán được cộng lại trong CFO.'
      },
      {
        h: '4. Quy trình kiểm tra mô hình ba báo cáo',
        p: [
          'Hãy lập từ trái sang phải theo logic kinh doanh: forecast doanh thu và chi phí, tính lợi nhuận, dự báo vốn lưu động/tài sản/nợ, lập dòng tiền, rồi kiểm tra bảng cân đối. Không nên ép số tiền cuối kỳ cho khớp nếu chưa biết nguồn của chênh lệch.',
          'Một model tốt có các kiểm tra tự động như bảng cân đối bằng 0, tiền không âm nếu không được phép, công thức không tự tham chiếu vòng lặp vô ý và giả định tách khỏi phần tính. Những kiểm tra này giúp intern tránh gửi một file có vẻ hợp lý nhưng sai cấu trúc.'
        ],
        list: [
          'Kiểm tra cân đối: Tài sản - Nợ - Vốn chủ = 0.',
          'Kiểm tra tiền: tiền cuối kỳ trong CFS = tiền trên bảng cân đối.',
          'Kiểm tra dấu: tăng tài sản hoạt động thường dùng tiền; tăng nợ hoạt động thường tạo tiền tạm thời.',
          'Kiểm tra kỳ: không cộng số tháng với số năm hoặc số lũy kế với số riêng kỳ.'
        ]
      }
    ],
    keyPoints: [
      'Ba báo cáo liên kết qua lợi nhuận giữ lại, khấu hao, vốn lưu động và tiền cuối kỳ.',
      'Bán chịu có thể tăng lợi nhuận nhưng chưa tăng tiền.',
      'Mua tài sản là CFI; khấu hao là chi phí không tiền mặt được điều chỉnh trong CFO.',
      'Kiểm tra cân đối và tiền cuối kỳ là bắt buộc trước khi dùng model.'
    ],
    relatedTerms: ['Ba báo cáo tài chính', 'Lợi nhuận giữ lại', 'Bán chịu', 'Khấu hao', 'Kiểm tra cân đối'],
    tryIt: { text: 'Vẽ mũi tên liên kết cho giao dịch bán chịu: doanh thu, phải thu, lợi nhuận, CFO và tiền mặt bị tác động thế nào?', link: '/corporate-finance' },
  }),
  lesson({
    id: 'tai-san-ngan-han-va-von-luu-dong',
    title: 'Bài 8 · Tài sản ngắn hạn và vốn lưu động',
    level: 'Cơ bản',
    minutes: 26,
    chapter: 'Chương 3 · Tài sản ngắn hạn và tài sản dài hạn',
    summary: 'Hiểu vốn lưu động không phải một con số tĩnh mà là tiền bị gắn trong chu kỳ mua hàng, sản xuất, bán hàng và thu tiền.',
    sections: [
      {
        h: '1. Vốn lưu động đang làm gì trong doanh nghiệp?',
        p: [
          'Vốn lưu động ròng thường được nhìn là tài sản ngắn hạn trừ nợ ngắn hạn. Trong vận hành, phần quan trọng hơn là các khoản gắn trực tiếp với chu kỳ kinh doanh: phải thu, tồn kho và phải trả nhà cung cấp. Chúng quyết định doanh nghiệp phải bỏ tiền trước bao lâu rồi mới thu lại được tiền từ khách hàng.',
          'Ví dụ, cửa hàng trả nhà cung cấp sau 30 ngày, giữ hàng 45 ngày trước khi bán và khách thanh toán sau 20 ngày. Tiền bị khóa trong chu kỳ từ lúc trả tiền hàng đến lúc thu khách sẽ tạo áp lực lớn hơn so với cửa hàng bán thu tiền ngay.'
        ],
        tip: '“Vốn lưu động tăng” không luôn tốt hoặc xấu. Tăng tồn kho trước mùa cao điểm có thể hợp lý; tăng phải thu do khách chậm trả có thể đáng lo.'
      },
      {
        h: '2. Ba đòn bẩy vận hành',
        p: [
          'Quản trị phải thu là cân bằng giữa bán được hàng và thu được tiền. Siết tín dụng quá mức có thể mất khách, nới quá mức có thể tạo nợ xấu. Quản trị tồn kho là cân bằng giữa thiếu hàng làm mất doanh thu và thừa hàng làm chôn vốn/giảm giá. Quản trị phải trả là dùng điều khoản nhà cung cấp hợp lý mà không làm mất uy tín hoặc chiết khấu tốt.',
          'Các bộ phận thường nhìn mục tiêu khác nhau: sales muốn bán chịu để chốt đơn; mua hàng muốn nhập nhiều để có giá tốt; tài chính muốn tiền về sớm. Công việc của finance là lượng hóa chi phí và lợi ích để đưa ra ngưỡng vận hành, thay vì chỉ yêu cầu mọi người “giảm tồn kho”.'
        ],
        list: [
          'Phải thu cao: doanh thu có thể đẹp nhưng cần kiểm tra tuổi nợ và khả năng thu hồi.',
          'Tồn kho cao: cần tách hàng quay nhanh, hàng mùa vụ và hàng lỗi thời.',
          'Phải trả cao: tạo tiền ngắn hạn nhưng có thể che giấu áp lực thanh toán nếu quá hạn.'
        ]
      },
      {
        h: '3. Chu kỳ chuyển đổi tiền',
        p: [
          'Một công thức quản trị phổ biến là chu kỳ chuyển đổi tiền = ngày tồn kho + ngày phải thu - ngày phải trả. Nó ước lượng số ngày doanh nghiệp phải tự tài trợ cho hoạt động trước khi thu lại tiền. Con số thấp hơn thường tốt hơn, nhưng cần so trong cùng ngành và cùng mô hình kinh doanh.',
          'Ví dụ, ngày tồn kho 50, ngày phải thu 35, ngày phải trả 25 thì chu kỳ chuyển đổi tiền là 60 ngày. Nếu doanh số một ngày trung bình là 10 triệu và chi phí hoạt động phù hợp là 7 triệu, người quản lý có thể ước lượng quy mô tiền cần cho chu kỳ này thay vì chỉ nhìn một số dư ngân hàng ngẫu nhiên.'
        ],
        tip: 'Không dùng số ngày như khẩu hiệu. Hãy truy ngược ra các chính sách: điều khoản thanh toán nào, SKU nào chậm, khách hàng nào quá hạn và ai có quyền thay đổi chúng.'
      },
      {
        h: '4. Những cảnh báo sớm',
        p: [
          'Nếu doanh thu tăng nhưng phải thu tăng nhanh hơn, khả năng thu tiền có thể đang suy yếu. Nếu tồn kho tăng nhanh hơn doanh thu, hãy kiểm tra dự báo nhu cầu, hàng chậm luân chuyển và thay đổi giá đầu vào. Nếu phải trả tăng đột biến, xem doanh nghiệp có đang trì hoãn thanh toán vì thiếu tiền không.',
          'Một báo cáo vốn lưu động có ích sẽ tách tổng biến động thành vài khách hàng, nhóm hàng hoặc nhà cung cấp chính; nêu hành động, người phụ trách và ngày dự kiến. Chỉ ghi “tăng 20 tỷ” sẽ không giúp ai quyết định.'
        ],
        list: [
          'Lập báo cáo tuổi nợ phải thu và danh sách khoản quá hạn.',
          'Tính vòng quay tồn kho theo nhóm sản phẩm, không chỉ toàn công ty.',
          'Dự báo thu chi theo tuần khi thanh khoản căng, thay vì chờ báo cáo tháng.'
        ]
      }
    ],
    keyPoints: [
      'Vốn lưu động là tiền chạy trong chu kỳ mua, bán và thu tiền.',
      'Phải thu, tồn kho và phải trả cần được quản trị cùng nhau.',
      'Chu kỳ chuyển đổi tiền đo thời gian doanh nghiệp tự tài trợ cho vận hành.',
      'Phân tích tốt phải đi từ tổng số xuống khách hàng, SKU hoặc nhà cung cấp cụ thể.'
    ],
    relatedTerms: ['Vốn lưu động ròng', 'Phải thu', 'Tồn kho', 'Phải trả', 'Chu kỳ chuyển đổi tiền', 'Tuổi nợ'],
    tryIt: { text: 'Tính chu kỳ chuyển đổi tiền khi DIO = 48 ngày, DSO = 32 ngày và DPO = 27 ngày; nêu một cách rút ngắn 5 ngày.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'tai-san-co-dinh-va-nguyen-gia',
    title: 'Bài 9 · Tài sản cố định, nguyên giá và quyết định mua sắm',
    level: 'Cơ bản',
    minutes: 24,
    chapter: 'Chương 3 · Tài sản ngắn hạn và tài sản dài hạn',
    summary: 'Phân biệt chi phí kỳ hiện tại với tài sản sử dụng nhiều kỳ, hiểu nguyên giá và biết vì sao một đề xuất mua sắm phải có cả lý do vận hành lẫn dòng tiền.',
    sections: [
      {
        h: '1. Khi nào một khoản chi trở thành tài sản?',
        p: [
          'Một khoản chi thường được ghi nhận là tài sản khi doanh nghiệp kiểm soát nguồn lực, kỳ vọng nhận lợi ích kinh tế trong nhiều kỳ và có thể đo lường đáng tin cậy. Máy đóng gói dùng năm năm thường là tài sản cố định; giấy in dùng trong tháng thường là chi phí kỳ hiện tại.',
          'Phân loại ảnh hưởng đến thời điểm ghi nhận chi phí chứ không làm thay đổi thực tế tiền đã chi. Nếu mua máy 500 triệu, tiền giảm 500 ngay ngày mua, nhưng chi phí trên báo cáo kết quả thường được phân bổ dần qua khấu hao trong các năm sử dụng.'
        ],
        tip: 'Đừng cố “vốn hóa” mọi khoản chi để làm lợi nhuận năm nay đẹp hơn. Phân loại phải tuân theo chính sách kế toán và bản chất lợi ích kinh tế, không phải mục tiêu chỉ tiêu.'
      },
      {
        h: '2. Nguyên giá không chỉ là giá ghi trên hóa đơn',
        p: [
          'Nguyên giá ban đầu thường bao gồm giá mua và các chi phí trực tiếp cần để đưa tài sản vào trạng thái sẵn sàng sử dụng, chẳng hạn vận chuyển, lắp đặt và chạy thử hợp lý. Chi phí đào tạo nhân viên hoặc chi phí vận hành sau khi tài sản đã sẵn sàng thường được xử lý khác tùy chính sách và chuẩn mực áp dụng.',
          'Ví dụ, máy giá 400 triệu, vận chuyển 15 triệu, lắp đặt 25 triệu. Nếu các khoản này trực tiếp cần để đưa máy vào hoạt động, cơ sở nguyên giá có thể là 440 triệu. Cần kiểm tra chính sách của doanh nghiệp và chứng từ thay vì tự suy đoán.'
        ],
        list: [
          'Mô tả tài sản, nơi đặt, bộ phận sử dụng và chủ sở hữu vận hành.',
          'Nguyên giá, ngày sẵn sàng sử dụng, thời gian hữu ích và phương pháp khấu hao.',
          'Nguồn vốn, hợp đồng mua, điều kiện bảo hành và chi phí vận hành dự kiến.'
        ]
      },
      {
        h: '3. Quyết định mua tài sản khác với ghi nhận kế toán',
        p: [
          'Trước khi mua, người làm tài chính cần hỏi máy giúp tăng doanh thu, giảm chi phí, giảm rủi ro hay đáp ứng yêu cầu pháp lý nào. Sau đó ước lượng tiền đầu tư ban đầu, thời gian triển khai, chi phí bảo trì, nhu cầu vốn lưu động và giá trị thu hồi. Khấu hao là thông tin cần thiết nhưng không thay thế dòng tiền dự án.',
          'Ví dụ, máy tự động hóa giá 600 triệu giảm 18 triệu tiền lương mỗi tháng nhưng cần bảo trì 3 triệu mỗi tháng. Lợi ích tiền thuần trước thuế là khoảng 15 triệu mỗi tháng, chưa tính thuế, thời điểm hoạt động, đào tạo, rủi ro vận hành và giá trị bán lại. Đây mới là đầu vào để tính NPV sau này.'
        ],
        tip: '“Giảm chi phí 20 triệu/tháng” cần được hỏi tiếp: giảm khoản nào, có thật sự tránh được tiền chi hay chỉ chuyển nhân sự sang việc khác, và khi nào tiết kiệm bắt đầu?'
      },
      {
        h: '4. Quản lý tài sản sau khi mua',
        p: [
          'Tài sản chỉ tạo giá trị khi được sử dụng, bảo dưỡng và kiểm kê đúng. Danh mục tài sản nên có mã, địa điểm, người chịu trách nhiệm, tình trạng, nguyên giá, khấu hao lũy kế và lịch bảo trì. Thiếu kiểm soát, doanh nghiệp có thể vừa mua thêm tài sản mới vừa để thiết bị cũ nhàn rỗi hoặc thất lạc.',
          'Từ góc độ tài chính, hãy theo dõi công suất sử dụng, chi phí bảo trì, thời gian dừng máy, sản lượng tạo ra và nhu cầu thay thế. Một tài sản chưa khấu hao hết vẫn có thể cần đánh giá suy giảm nếu không còn tạo được lợi ích như kỳ vọng.'
        ],
        list: [
          'Kiểm kê thực tế định kỳ và đối chiếu với sổ tài sản.',
          'Phân biệt chi phí sửa chữa duy trì với nâng cấp làm tăng lợi ích dài hạn.',
          'Đánh giá thanh lý, thay thế hoặc tiếp tục sử dụng bằng dòng tiền chênh lệch.'
        ]
      }
    ],
    keyPoints: [
      'Tài sản dài hạn tạo lợi ích nhiều kỳ; tiền vẫn chi ra ngay tại thời điểm mua.',
      'Nguyên giá cần phản ánh các chi phí trực tiếp đưa tài sản vào trạng thái sẵn sàng sử dụng.',
      'Đề xuất CAPEX cần dòng tiền, thời gian, rủi ro và người sở hữu vận hành.',
      'Quản lý sau mua quyết định tài sản có thật sự tạo giá trị hay không.'
    ],
    relatedTerms: ['Tài sản cố định', 'Nguyên giá', 'CAPEX', 'Giá trị thanh lý', 'Suy giảm tài sản', 'Kiểm kê'],
    tryIt: { text: 'Viết danh sách thông tin cần có để phê duyệt mua một máy 450 triệu đồng cho xưởng sản xuất.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'khau-hao-va-quan-ly-vong-doi-tai-san',
    title: 'Bài 10 · Khấu hao và vòng đời tài sản',
    level: 'Cơ bản',
    minutes: 25,
    chapter: 'Chương 3 · Tài sản ngắn hạn và tài sản dài hạn',
    summary: 'Nắm khấu hao như cách phân bổ chi phí của tài sản qua thời gian, hiểu tác động đến lợi nhuận, thuế và dòng tiền, đồng thời tránh dùng khấu hao thay cho đánh giá đầu tư.',
    sections: [
      {
        h: '1. Khấu hao mô tả điều gì?',
        p: [
          'Khấu hao là việc phân bổ có hệ thống phần giá trị có thể khấu hao của tài sản vào các kỳ mà tài sản phục vụ. Nó không phải khoản tiền trả lại mỗi tháng cho nhà cung cấp và cũng không nói chính xác giá trị thị trường hiện tại của máy.',
          'Ví dụ, máy có nguyên giá 500 triệu, giá trị thu hồi ước tính 50 triệu, thời gian hữu ích 5 năm. Theo đường thẳng, chi phí khấu hao năm là (500 - 50) / 5 = 90 triệu. Giá trị sổ sách sau năm đầu giảm xuống 410 triệu nếu không có điều chỉnh khác.'
        ],
        tip: 'Nếu không có tiền ra trong kỳ, tại sao phải quan tâm khấu hao? Vì nó làm thay đổi lợi nhuận kế toán, thuế phải nộp và cách đánh giá hiệu quả từng bộ phận.'
      },
      {
        h: '2. Khấu hao tác động tới ba báo cáo ra sao?',
        p: [
          'Trên báo cáo kết quả kinh doanh, khấu hao là chi phí nên làm lợi nhuận trước thuế giảm. Trên bảng cân đối, khấu hao lũy kế tăng làm giá trị sổ sách ròng của tài sản giảm. Trên lưu chuyển tiền theo phương pháp gián tiếp, khấu hao được cộng lại vì đã làm giảm lợi nhuận nhưng không phải tiền chi trong kỳ.',
          'Nếu thuế suất là 20%, chi phí khấu hao 90 triệu có thể làm thuế giảm khoảng 18 triệu trong điều kiện doanh nghiệp có lợi nhuận chịu thuế và được khấu trừ theo quy định. Lợi ích tiền thật này thường được gọi là lá chắn thuế của khấu hao. Quy tắc thuế thực tế phải được kiểm tra theo pháp luật và chính sách hiện hành.'
        ],
        list: [
          'Lợi nhuận giảm do khấu hao: có tính kế toán.',
          'CFO được cộng lại khấu hao: loại bỏ khoản chi phí không tiền mặt.',
          'Thuế có thể giảm: là tác động tiền mặt gián tiếp nếu điều kiện thuế đáp ứng.'
        ]
      },
      {
        h: '3. Phương pháp và giả định cần nhất quán',
        p: [
          'Đường thẳng phân bổ đều mỗi kỳ, dễ hiểu và thường phù hợp khi mức sử dụng tương đối ổn định. Một số tài sản có thể được phân bổ theo sản lượng hoặc phương pháp khác nếu phản ánh mô hình tiêu thụ lợi ích tốt hơn. Điều cốt lõi là thời gian hữu ích, giá trị thu hồi và phương pháp phải có cơ sở, được áp dụng nhất quán và xem xét lại khi điều kiện thay đổi.',
          'Kéo dài thời gian hữu ích chỉ để giảm chi phí khấu hao sẽ làm lợi nhuận hiện tại đẹp hơn nhưng khiến báo cáo kém trung thực. Ngược lại, đặt thời gian quá ngắn có thể làm chi phí dồn quá mức. Người làm finance cần hỏi bộ phận kỹ thuật về tình trạng, công suất và lịch thay thế, không chọn một số theo cảm tính.'
        ],
        tip: 'Tách hai câu hỏi: “sổ sách phân bổ thế nào?” và “tài sản có tiếp tục tạo tiền không?”. Khấu hao trả lời câu thứ nhất; đánh giá suy giảm và quyết định thay thế trả lời câu thứ hai.'
      },
      {
        h: '4. Dùng khấu hao trong phân tích đúng cách',
        p: [
          'Khi đánh giá dự án, dùng dòng tiền sau thuế chứ không lấy lợi nhuận kế toán làm dòng tiền. Khấu hao được đưa vào vì ảnh hưởng thuế, sau đó cộng lại trong cầu nối từ EBIT đến dòng tiền hoạt động. Chi mua tài sản ban đầu vẫn ghi riêng tại thời điểm đầu tư.',
          'Ví dụ, dự án tạo EBIT trước khấu hao 160 triệu, khấu hao 90 triệu, thuế 20%. EBIT sau khấu hao là 70; thuế là 14; lợi nhuận hoạt động sau thuế là 56; cộng lại khấu hao 90 thì dòng tiền hoạt động là 146 triệu, trước vốn lưu động và CAPEX. Cách đi này giúp bạn thấy rõ phần tiết kiệm thuế.'
        ],
        list: [
          'Không cộng khấu hao vào tiền nếu bạn chưa trừ nó khỏi lợi nhuận ban đầu.',
          'Không thay chi mua tài sản ban đầu bằng chi phí khấu hao.',
          'Kiểm tra giả định thuế và khả năng doanh nghiệp sử dụng lá chắn thuế.'
        ]
      }
    ],
    keyPoints: [
      'Khấu hao phân bổ chi phí tài sản, không phải tiền chi lại mỗi kỳ.',
      'Khấu hao giảm lợi nhuận và có thể tạo lá chắn thuế, rồi được cộng lại trong CFO gián tiếp.',
      'Thời gian hữu ích và giá trị thu hồi phải có cơ sở vận hành.',
      'Trong dự án, khấu hao ảnh hưởng dòng tiền qua thuế chứ không thay thế CAPEX.'
    ],
    relatedTerms: ['Khấu hao', 'Giá trị thu hồi', 'Giá trị sổ sách', 'Khấu hao lũy kế', 'Lá chắn thuế', 'EBIT'],
    tryIt: { text: 'Tính khấu hao đường thẳng cho tài sản nguyên giá 360, giá trị thu hồi 60, dùng 5 năm; sau đó nêu tác động lên lợi nhuận năm đầu.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'quy-trinh-phan-tich-tai-chinh',
    title: 'Bài 11 · Quy trình phân tích tài chính có thể kiểm chứng',
    level: 'Cơ bản',
    minutes: 25,
    chapter: 'Chương 4 · Phân tích tài chính trong quản lý doanh nghiệp',
    summary: 'Học quy trình từ câu hỏi quản trị đến dữ liệu, so sánh, giả thuyết và hành động; tránh biến phân tích thành danh sách tỷ số không có kết luận.',
    sections: [
      {
        h: '1. Bắt đầu bằng quyết định, không bắt đầu bằng Excel',
        p: [
          'Phân tích tài chính có ích khi nó hỗ trợ một quyết định cụ thể: có cần bổ sung vốn lưu động, có nên giảm tín dụng cho khách, tại sao biên lợi nhuận giảm hoặc dự án nào nên ưu tiên. Nếu không xác định câu hỏi, bạn dễ tạo nhiều biểu đồ nhưng không biết số nào quan trọng.',
          'Hãy viết một câu hỏi có người sử dụng và thời hạn, ví dụ: “Trước thứ Sáu, cho biết vì sao dòng tiền tháng 7 thấp hơn kế hoạch 1 tỷ và cần hành động gì trong 4 tuần tới.” Câu hỏi này quyết định phạm vi dữ liệu và độ sâu phù hợp.'
        ],
        tip: 'Một tỷ số không phải kết luận. “DSO tăng 12 ngày” là quan sát; “tập trung xử lý ba khách quá hạn vì chúng chiếm 70% phần tăng” mới là insight hành động.'
      },
      {
        h: '2. Chuẩn bị dữ liệu trước khi tính',
        p: [
          'Dữ liệu cần cùng định nghĩa, kỳ và đơn vị. So sánh doanh thu tháng này với lũy kế năm trước, hoặc số kế hoạch chưa điều chỉnh với số thực tế đã đổi phạm vi, sẽ tạo chênh lệch giả. Luôn xác định nguồn số, ngày chốt, loại tiền, đơn vị và việc số đã kiểm toán hay chưa.',
          'Sau đó kiểm tra tính hợp lý: tổng chi tiết có bằng tổng báo cáo không, dấu âm/dương có nhất quán không, có giao dịch một lần lớn không và chuỗi thời gian có đứt đoạn không. Thời gian kiểm tra dữ liệu thường tiết kiệm nhiều hơn thời gian làm biểu đồ.'
        ],
        list: [
          'Nguồn: ERP, sổ cái, báo cáo quản trị, hợp đồng, dữ liệu vận hành hoặc báo cáo công bố.',
          'Chuẩn hóa: kỳ, đơn vị, mã đối tượng, tiền tệ và định nghĩa KPI.',
          'Đối chiếu: tổng - chi tiết, actual - budget, số hiện tại - số kỳ trước.'
        ]
      },
      {
        h: '3. So sánh để tạo giả thuyết',
        p: [
          'Bốn trục so sánh hữu ích là theo thời gian, với kế hoạch, với đối thủ/cùng ngành và với cấu trúc nội bộ. Một biên gộp 25% không tự nói lên tốt xấu; nó cần được đặt cạnh mức 29% kỳ trước, 27% kế hoạch hoặc chuẩn ngành tương đồng.',
          'Sau khi thấy chênh lệch, phân rã nó thành các nhân tố có thể kiểm tra. Ví dụ, biên gộp giảm do giá bán giảm, chi phí nguyên liệu tăng hay cơ cấu hàng bán chuyển sang sản phẩm biên thấp. Mỗi giả thuyết phải gắn với dữ liệu hoặc người có thể xác nhận.'
        ],
        tip: 'Tách nhãn “fact”, “hypothesis” và “decision”. Điều này giúp bạn trung thực về mức độ chắc chắn thay vì biến phỏng đoán thành kết luận.'
      },
      {
        h: '4. Kết thúc bằng hành động và cơ chế theo dõi',
        p: [
          'Một ghi chú phân tích nên trả lời: điều gì đã xảy ra, tại sao có khả năng xảy ra, mức độ ảnh hưởng, cần làm gì, ai làm và khi nào kiểm tra lại. Nếu nguyên nhân chưa xác định, kết luận tốt vẫn có thể là một kế hoạch lấy dữ liệu với hạn chót rõ ràng.',
          'Ví dụ: “CFO thấp hơn forecast 800 triệu, chủ yếu do phải thu khách A/B/C tăng. Tài chính đối chiếu lịch thanh toán trước ngày 15; sales xác nhận tranh chấp hóa đơn; treasury chuẩn bị kịch bản thu chậm thêm 14 ngày.” Đó là đầu ra có thể quản trị được.'
        ],
        list: [
          'Kết luận một câu, không lặp cả bảng số.',
          'Ba bằng chứng quan trọng và giả định còn mở.',
          'Hành động, chủ sở hữu, hạn hoàn thành và chỉ số theo dõi lại.'
        ]
      }
    ],
    keyPoints: [
      'Câu hỏi quản trị quyết định dữ liệu và phương pháp phân tích.',
      'Chuẩn hóa định nghĩa, kỳ và đơn vị trước khi tính tỷ số.',
      'So sánh tạo giả thuyết; dữ liệu và người chịu trách nhiệm giúp kiểm chứng.',
      'Báo cáo tốt luôn kết thúc bằng hành động, owner và deadline.'
    ],
    relatedTerms: ['Phân tích tài chính', 'Actual', 'Budget', 'Benchmark', 'Giả thuyết', 'KPI'],
    tryIt: { text: 'Viết một câu hỏi phân tích cho tình huống “dòng tiền tháng này thấp hơn kế hoạch”, kèm người dùng báo cáo và deadline.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'thanh-khoan-va-hieu-qua-hoat-dong',
    title: 'Bài 12 · Thanh khoản và hiệu quả hoạt động',
    level: 'Cơ bản',
    minutes: 28,
    chapter: 'Chương 4 · Phân tích tài chính trong quản lý doanh nghiệp',
    summary: 'Dùng tỷ số thanh khoản và vòng quay để đặt câu hỏi đúng về khả năng trả nợ ngắn hạn, tốc độ dùng tài sản và tiền bị mắc trong vận hành.',
    sections: [
      {
        h: '1. Thanh khoản không chỉ là số tiền mặt',
        p: [
          'Thanh khoản là khả năng đáp ứng nghĩa vụ đến hạn mà không phải bán tháo tài sản hoặc vay khẩn cấp với chi phí cao. Tiền mặt rất thanh khoản, nhưng khoản phải thu tốt cũng có thể sớm thành tiền; ngược lại, tồn kho chậm luân chuyển có thể gần như không giúp được khi cần trả nợ tuần này.',
          'Tỷ số thanh toán hiện hành = tài sản ngắn hạn / nợ ngắn hạn. Tỷ số nhanh thường loại tồn kho khỏi tử số. Ví dụ, tài sản ngắn hạn 500, trong đó tồn kho 220, nợ ngắn hạn 400: current ratio là 1,25; quick ratio là 0,70. Nhưng số này phải được đọc cùng tuổi nợ và lịch tiền.'
        ],
        tip: 'Tỷ số cao có thể do tiền tốt, nhưng cũng có thể do tồn kho ứ đọng hoặc phải thu khó đòi. Luôn nhìn chất lượng từng thành phần trước khi yên tâm.'
      },
      {
        h: '2. Vòng quay giúp thấy tốc độ',
        p: [
          'Vòng quay tồn kho thường lấy giá vốn hàng bán chia tồn kho bình quân; vòng quay phải thu thường lấy doanh thu tín dụng hoặc doanh thu phù hợp chia phải thu bình quân. Chuyển sang số ngày giúp người vận hành dễ hình dung: số ngày tồn kho = 365 / vòng quay tồn kho.',
          'Ví dụ, giá vốn 3.650 triệu và tồn kho bình quân 500 triệu tạo vòng quay 7,3 lần/năm, tương đương khoảng 50 ngày tồn kho. Nếu năm trước là 35 ngày, bạn cần biết đó là vì chủ động dự trữ trước mùa cao điểm hay hàng đang bán chậm.'
        ],
        list: [
          'DIO: số ngày hàng ở trong kho trước khi chuyển thành doanh thu.',
          'DSO: số ngày bình quân từ bán hàng đến thu tiền khách.',
          'DPO: số ngày bình quân doanh nghiệp trả nhà cung cấp.',
          'Vòng quay tổng tài sản: doanh thu tạo ra trên mỗi đồng tài sản bình quân.'
        ]
      },
      {
        h: '3. Phân tích theo ngành và mô hình',
        p: [
          'Một siêu thị có thể có DSO rất thấp vì thu tiền ngay nhưng biên lợi nhuận mỏng; một công ty xây dựng có DSO dài do nghiệm thu theo dự án. Không thể kết luận siêu thị tốt hơn chỉ từ DSO. Hãy so với chính lịch sử của công ty, mục tiêu vận hành và doanh nghiệp cùng mô hình.',
          'Tỷ số cũng bị ảnh hưởng mùa vụ và số dư cuối kỳ. Nếu tồn kho cuối tháng giảm mạnh vì vừa giao một đơn hàng lớn, dùng số cuối kỳ để đại diện cả tháng có thể làm vòng quay bị méo. Khi có thể, dùng số bình quân hoặc nhiều điểm dữ liệu.'
        ],
        tip: 'Đừng xếp hạng công ty chỉ bằng một tỷ số. Hãy tìm “câu chuyện vận hành” phía sau nó: chính sách bán chịu, chuỗi cung ứng, mùa vụ, tăng trưởng hoặc vấn đề thu hồi.'
      },
      {
        h: '4. Chuyển tỷ số thành kế hoạch tiền',
        p: [
          'Nếu DSO tăng từ 40 lên 55 ngày khi doanh thu bình quân một ngày là 30 triệu, tiền bị gắn thêm xấp xỉ 450 triệu trước khi xét các yếu tố khác. Đây là cách biến một KPI thành quy mô ảnh hưởng để ưu tiên hành động.',
          'Hành động có thể là xác minh hóa đơn, gọi khách theo thứ tự tuổi nợ, sửa điều khoản thanh toán, yêu cầu đặt cọc hoặc điều chỉnh forecast tiền. Mỗi phương án có đánh đổi doanh thu, quan hệ khách hàng và chi phí, nên finance cần phối hợp sales chứ không chỉ gửi bảng quá hạn.'
        ],
        list: [
          'Ưu tiên 80/20: khách hàng/SKU chiếm phần lớn biến động.',
          'Đặt chỉ số theo dõi và ngưỡng cảnh báo, ví dụ tỷ lệ nợ quá hạn trên 60 ngày.',
          'Cập nhật forecast tiền nếu các giả định thu tiền thay đổi.'
        ]
      }
    ],
    keyPoints: [
      'Thanh khoản là khả năng trả đúng hạn, không chỉ là số tiền cuối tháng.',
      'Current ratio và quick ratio cần được đọc cùng chất lượng tài sản ngắn hạn.',
      'DIO, DSO và DPO biến số dư kế toán thành tốc độ vận hành.',
      'Tỷ số chỉ có ý nghĩa khi so đúng ngành, kỳ và bối cảnh.'
    ],
    relatedTerms: ['Current ratio', 'Quick ratio', 'DIO', 'DSO', 'DPO', 'Vòng quay tài sản'],
    tryIt: { text: 'Tính current ratio và quick ratio khi tiền + phải thu = 180, tồn kho = 120, nợ ngắn hạn = 240 triệu; giải thích điểm cần kiểm tra tiếp.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'sinh-loi-don-bay-va-dupont',
    title: 'Bài 13 · Sinh lời, đòn bẩy và mô hình DuPont',
    level: 'Cơ bản',
    minutes: 28,
    chapter: 'Chương 4 · Phân tích tài chính trong quản lý doanh nghiệp',
    summary: 'Phân tích ROA và ROE theo động lực bên trong, nhận diện lúc nợ khuếch đại kết quả tốt và lúc nó khuếch đại rủi ro.',
    sections: [
      {
        h: '1. ROA và ROE trả lời hai góc nhìn khác nhau',
        p: [
          'ROA thường lấy lợi nhuận phù hợp chia tài sản bình quân, cho biết doanh nghiệp dùng toàn bộ nguồn lực tài sản hiệu quả đến đâu. ROE lấy lợi nhuận sau thuế chia vốn chủ sở hữu bình quân, cho biết lợi nhuận tạo ra cho phần vốn của chủ sở hữu.',
          'ROE cao không tự động tốt hơn. Một doanh nghiệp có thể nâng ROE bằng cách giảm vốn chủ và vay nhiều hơn, trong khi rủi ro trả nợ tăng. Vì vậy ROE luôn cần đi cùng cấu trúc nợ, chi phí lãi vay và độ ổn định của dòng tiền.'
        ],
        tip: 'Đừng dùng số cuối kỳ làm mẫu số khi doanh nghiệp tăng/giảm tài sản lớn trong năm. Nếu có thể, dùng bình quân đầu kỳ và cuối kỳ để giảm méo số.'
      },
      {
        h: '2. DuPont tách ROE thành ba đòn bẩy',
        p: [
          'Mô hình DuPont đơn giản: ROE = biên lợi nhuận ròng × vòng quay tài sản × hệ số đòn bẩy tài chính. Cách tách này giúp bạn biết ROE đến từ bán có lãi, dùng tài sản nhanh hay dùng nhiều nợ/vốn chủ ít hơn.',
          'Ví dụ, biên ròng 5%, vòng quay tài sản 2 lần và tài sản/vốn chủ bình quân 1,8 lần tạo ROE khoảng 18%. Nếu ROE tăng lên 24%, không nên vui ngay; cần xem đó là do biên tăng, vòng quay tăng hay đòn bẩy tăng. Ba nguồn tăng có ý nghĩa rủi ro khác nhau.'
        ],
        list: [
          'Biên ròng: khả năng giữ lại lợi nhuận trên mỗi đồng doanh thu.',
          'Vòng quay tài sản: hiệu quả sử dụng tài sản để tạo doanh thu.',
          'Đòn bẩy tài chính: mức tài sản được tài trợ bằng nợ so với vốn chủ.'
        ]
      },
      {
        h: '3. Đòn bẩy tài chính là con dao hai lưỡi',
        p: [
          'Vay nợ có thể giúp doanh nghiệp đầu tư sớm, không pha loãng quyền sở hữu và hưởng lợi từ lá chắn thuế lãi vay trong điều kiện phù hợp. Nhưng lãi và gốc là nghĩa vụ tiền mặt. Khi doanh thu giảm, khoản thanh toán cố định có thể làm lợi nhuận chủ sở hữu giảm nhanh hơn nhiều so với doanh nghiệp ít nợ.',
          'Các chỉ số như nợ/vốn chủ, nợ ròng/EBITDA hoặc khả năng thanh toán lãi được dùng phổ biến, nhưng không có một ngưỡng chung cho mọi doanh nghiệp. Công ty tiện ích có dòng tiền ổn định có thể chịu nợ khác công ty công nghệ biến động mạnh.'
        ],
        tip: 'Lãi vay được ghi nhận theo kỳ nhưng nợ gốc cũng phải trả bằng tiền. Một phân tích nợ chỉ nhìn chi phí lãi vay là chưa đủ.'
      },
      {
        h: '4. Cách viết nhận định không bị hời hợt',
        p: [
          'Thay vì viết “ROE tốt”, hãy viết: “ROE tăng từ 16% lên 20%, trong đó biên ròng tăng 1 điểm phần trăm nhờ giá bán và vòng quay ổn định; đòn bẩy không tăng đáng kể. Cần kiểm chứng phần tăng giá có bền vững.” Câu này cho người đọc biết nguồn tăng và điều cần theo dõi.',
          'Nếu ROE tăng chủ yếu do vốn chủ giảm vì trả cổ tức lớn hoặc mua lại cổ phần, bạn cần cảnh báo về thanh khoản và khả năng tái đầu tư. Tỷ số là cửa mở đầu câu hỏi, không phải nhãn dán cuối cùng.'
        ],
        list: [
          'So theo thời gian để nhận hướng thay đổi.',
          'Phân rã DuPont để xác định động lực.',
          'Kiểm tra nợ, lịch đáo hạn, chi phí lãi và CFO để đánh giá rủi ro.'
        ]
      }
    ],
    keyPoints: [
      'ROA đo hiệu quả tài sản; ROE đo lợi nhuận cho vốn chủ.',
      'DuPont tách ROE thành biên, vòng quay tài sản và đòn bẩy.',
      'Nợ có thể nâng ROE nhưng cũng làm áp lực tiền mặt tăng.',
      'Nhận định tốt nêu nguồn biến động, không chỉ dán nhãn tỷ số cao/thấp.'
    ],
    relatedTerms: ['ROA', 'ROE', 'DuPont', 'Đòn bẩy tài chính', 'Khả năng thanh toán lãi', 'Nợ ròng'],
    tryIt: { text: 'Tính ROE theo DuPont với biên ròng 6%, vòng quay tài sản 1,5 và tài sản/vốn chủ 2; nêu yếu tố rủi ro cần xem thêm.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'viet-bao-cao-phan-tich-tai-chinh',
    title: 'Bài 14 · Viết báo cáo phân tích cho quản lý',
    level: 'Ứng dụng',
    minutes: 26,
    chapter: 'Chương 4 · Phân tích tài chính trong quản lý doanh nghiệp',
    summary: 'Chuyển tỷ số và bảng số thành một báo cáo một trang có thông điệp, bằng chứng, rủi ro và hành động cụ thể.',
    sections: [
      {
        h: '1. Người quản lý cần quyết định chứ không cần thêm bảng',
        p: [
          'Một báo cáo tài chính quản trị không phải bản sao của file Excel. Người đọc cần biết điều quan trọng nhất, tác động tiền/lợi nhuận, nguyên nhân đã xác nhận, phần chưa chắc và quyết định hoặc hành động cần phê duyệt.',
          'Dùng cấu trúc từ trên xuống: tiêu đề kết luận, ba đến năm số chứng minh, cầu nối nguyên nhân, rủi ro/giả định, hành động. Phần phụ lục chứa bảng chi tiết để ai cần có thể truy vết. Cấu trúc này giúp tránh mở đầu bằng 20 dòng số rồi hy vọng người đọc tự rút ra kết luận.'
        ],
        tip: 'Nếu bạn không thể viết kết luận trong một câu, thường là câu hỏi hoặc dữ liệu vẫn chưa đủ rõ. Hãy thu hẹp phạm vi trước khi thêm biểu đồ.'
      },
      {
        h: '2. Ví dụ về thông điệp có cấu trúc',
        p: [
          'Thay vì: “Doanh thu 6 tháng đạt 94% kế hoạch; chi phí tăng.” Hãy viết: “Lợi nhuận vận hành 6 tháng thấp hơn kế hoạch 1,2 tỷ, chủ yếu do biên gộp giảm 1,8 điểm phần trăm tại nhóm A; doanh thu chỉ thấp hơn kế hoạch 2%. Cần phê duyệt điều chỉnh giá và kiểm tra hợp đồng nguyên liệu trước ngày 20.”',
          'Thông điệp này làm rõ mức ảnh hưởng, nguồn chênh lệch, điều đã biết và quyết định cần thiết. Nếu nguyên nhân giá vốn mới là giả thuyết, hãy ghi đúng mức chắc chắn: “dữ liệu sơ bộ cho thấy…” và nêu người xác nhận.'
        ],
        list: [
          'Kết luận: điều gì và tác động bao nhiêu?',
          'Bằng chứng: số actual, budget, cùng kỳ và phân rã chính.',
          'Hành động: làm gì, ai làm, khi nào, quyết định nào cần phê duyệt?'
        ]
      },
      {
        h: '3. Chọn biểu đồ và bảng đúng việc',
        p: [
          'Biểu đồ đường phù hợp xu hướng theo thời gian; cột phù hợp actual so với budget; cầu nối waterfall phù hợp giải thích các nhân tố chênh lệch; bảng nhỏ phù hợp khi người đọc cần số chính xác. Tránh đồ thị 3D, quá nhiều màu hoặc 12 chỉ tiêu trên một biểu đồ khiến thông điệp biến mất.',
          'Mỗi biểu đồ cần tiêu đề kết luận, đơn vị, kỳ và nguồn. Một biểu đồ ghi “Doanh thu” buộc người đọc tự phân tích; tiêu đề “Doanh thu thấp hơn kế hoạch do sản lượng kênh đại lý” đã nói rõ điều cần chú ý.'
        ],
        tip: 'Đặt đơn vị ngay trên tiêu đề hoặc trục: “tỷ đồng”, “triệu đồng”, “%”, “ngày”. Không để người đọc đoán.'
      },
      {
        h: '4. Kiểm tra trước khi gửi',
        p: [
          'Trước khi gửi, rà dấu âm/dương, tổng số, đơn vị, kỳ so sánh, công thức và liên kết giữa slide/bảng. Đọc lại như người không tham gia lập báo cáo: họ có biết “thấp hơn kế hoạch” là thấp hơn bao nhiêu, do đâu và phải làm gì không?',
          'Cuối cùng, lưu vết phiên bản và giả định. Forecast sẽ thay đổi, nên cần phân biệt số đã chốt với số dự báo. Khi số thay đổi, hãy nêu thay đổi do dữ liệu mới hay do thay đổi giả định; đừng thay số âm thầm.'
        ],
        list: [
          'Kiểm tra logic và số học.',
          'Kiểm tra người đọc có thể hành động.',
          'Kiểm tra nguồn, ngày cập nhật, owner và phiên bản.'
        ]
      }
    ],
    keyPoints: [
      'Báo cáo quản trị bắt đầu bằng kết luận, không phải bằng bảng dữ liệu.',
      'Mỗi kết luận cần mức ảnh hưởng, bằng chứng, mức chắc chắn và hành động.',
      'Chọn biểu đồ theo câu hỏi, luôn ghi rõ đơn vị, kỳ và nguồn.',
      'Kiểm tra phiên bản và giả định giúp báo cáo có thể truy vết.'
    ],
    relatedTerms: ['Management reporting', 'Waterfall', 'Variance bridge', 'Executive summary', 'Assumption', 'Version control'],
    tryIt: { text: 'Viết một tiêu đề kết luận 25 từ cho trường hợp lợi nhuận thấp hơn kế hoạch do biên gộp, kèm một hành động có owner.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'lai-don-lai-kep-va-gia-tri-tuong-lai',
    title: 'Bài 15 · Lãi đơn, lãi kép và giá trị tương lai',
    level: 'Cơ bản',
    minutes: 24,
    chapter: 'Chương 5 · Giá trị thời gian của tiền',
    summary: 'Nắm được vì sao một đồng hôm nay khác một đồng năm sau, cách tính giá trị tương lai và cách xử lý lãi suất theo đúng kỳ tiền.',
    sections: [
      {
        h: '1. Vì sao tiền có giá trị theo thời gian?',
        p: [
          'Một đồng có hôm nay có thể được đầu tư, dùng để giảm khoản vay phải trả lãi hoặc dùng ngay khi cần. Một đồng nhận sau một năm không có các lựa chọn đó trong năm chờ đợi và còn chịu rủi ro không nhận đủ. Vì vậy khi so hai khoản tiền khác thời điểm, phải quy chúng về cùng một mốc thời gian.',
          'Giá trị thời gian của tiền không có nghĩa mọi người luôn thích nhận tiền sớm bất kể điều kiện. Nó là một nguyên tắc định lượng: để hoãn nhận tiền, bạn cần một khoản bù phù hợp cho cơ hội sử dụng, lạm phát và rủi ro.'
        ],
        tip: 'Trước mọi phép tính, khoanh tròn mốc thời gian: hôm nay, cuối mỗi năm hay đầu mỗi tháng. Nhiều lỗi tài chính đến từ việc dùng đúng công thức nhưng sai mốc.'
      },
      {
        h: '2. Lãi đơn và lãi kép khác nhau ở đâu?',
        p: [
          'Lãi đơn chỉ tính lãi trên vốn gốc. Với 100 triệu, lãi 10% một năm trong ba năm, lãi đơn là 100 × 10% × 3 = 30 triệu, giá trị cuối là 130 triệu. Lãi kép tính lãi trên cả vốn gốc lẫn lãi đã tích lũy, nên giá trị cuối là 100 × (1 + 10%)^3 = 133,1 triệu.',
          'Trong tài chính doanh nghiệp, lãi kép là cách mô tả phổ biến khi tiền được tái đầu tư hoặc khoản vay cộng dồn lãi. Chênh lệch nhỏ ở một năm có thể trở nên lớn ở nhiều năm; vì vậy phải đặc biệt thận trọng với lãi suất và số kỳ.'
        ],
        list: [
          'Giá trị tương lai một khoản tiền: FV = PV × (1 + r)^n.',
          'PV là tiền tại mốc đầu; r là lãi suất mỗi kỳ; n là số kỳ.',
          'Nếu lãi suất là năm thì n phải là số năm; nếu lãi suất là tháng thì n phải là số tháng.'
        ]
      },
      {
        h: '3. Lãi suất danh nghĩa, hiệu dụng và tần suất ghép lãi',
        p: [
          'Cùng một con số “12%/năm” có thể cho kết quả khác tùy cách ghép lãi. Nếu 12% danh nghĩa ghép hàng tháng, lãi mỗi tháng xấp xỉ 1%; lãi suất hiệu dụng năm là (1 + 1%)^12 - 1, khoảng 12,68%. Nếu trả lãi một lần cuối năm, lãi hiệu dụng là 12%.',
          'Khi so sánh các khoản vay hoặc đầu tư, đưa chúng về cùng cách tính. Không so 1%/tháng với 12%/năm bằng cảm giác; 1%/tháng ghép lãi tương đương hơn 12%/năm hiệu dụng. Hợp đồng thực tế còn có phí, ngày tính lãi và điều kiện trả trước cần đọc kỹ.'
        ],
        tip: 'Đừng gọi bất kỳ tỷ lệ nào là rẻ trước khi biết đó là tỷ lệ danh nghĩa hay hiệu dụng, ghép lãi bao nhiêu lần và có phí nào đi kèm.'
      },
      {
        h: '4. Dùng giá trị tương lai trong công việc',
        p: [
          'Giá trị tương lai giúp lập kế hoạch quỹ bảo trì, tính số tiền cần có khi thay máy, đánh giá chi phí của việc trì hoãn thanh toán và hiểu khoản vay tích lũy thế nào. Ví dụ, cần 240 triệu sau ba năm để thay thiết bị và có thể đầu tư với lợi suất 8%/năm; bài sau sẽ giúp tính số cần có hôm nay.',
          'Trong forecast, đừng tự động áp dụng một lãi suất cho mọi khoản. Khoản gửi ngân hàng, khoản vay, giá đầu vào và doanh thu có các động lực riêng. Công thức là công cụ quy đổi thời gian, không phải một dự báo kinh tế thay bạn.'
        ],
        list: [
          'Ghi rõ giả định về tỷ lệ, kỳ và việc ghép lãi.',
          'Làm một bảng kỳ 0, 1, 2, 3 để kiểm tra trực quan.',
          'Thử ít nhất một kịch bản lãi suất cao hơn/thấp hơn nếu quyết định nhạy cảm.'
        ]
      }
    ],
    keyPoints: [
      'Tiền ở các thời điểm khác nhau phải được quy về cùng một mốc trước khi so sánh.',
      'Lãi kép tính lãi trên lãi đã tích lũy: FV = PV × (1 + r)^n.',
      'Lãi suất và số kỳ phải cùng đơn vị thời gian.',
      'So sánh khoản vay/đầu tư bằng lãi hiệu dụng và điều kiện thực tế, không chỉ số quảng cáo.'
    ],
    relatedTerms: ['Giá trị tương lai', 'Lãi đơn', 'Lãi kép', 'Lãi suất danh nghĩa', 'Lãi suất hiệu dụng', 'Kỳ'],
    tryIt: { text: 'Tính giá trị tương lai của 80 triệu sau 4 năm với lãi kép 7%/năm; sau đó ghi một câu về giả định 7% này có thể sai ở đâu.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'gia-tri-hien-tai-va-ty-le-chiet-khau',
    title: 'Bài 16 · Giá trị hiện tại và tỷ lệ chiết khấu',
    level: 'Cơ bản',
    minutes: 28,
    chapter: 'Chương 5 · Giá trị thời gian của tiền',
    summary: 'Quy tiền tương lai về hôm nay để so sánh lựa chọn, hiểu ý nghĩa kinh tế của tỷ lệ chiết khấu và biết tại sao lựa chọn tỷ lệ này có thể thay đổi quyết định.',
    sections: [
      {
        h: '1. Từ giá trị tương lai quay về hiện tại',
        p: [
          'Giá trị hiện tại trả lời: cần bao nhiêu tiền hôm nay để tương đương một khoản tiền nhận trong tương lai, với một tỷ lệ yêu cầu cho trước. Công thức một dòng tiền là PV = FV / (1 + r)^n. Khi r hoặc n tăng, PV giảm vì bạn phải chờ lâu hơn hoặc cần mức bù cao hơn.',
          'Ví dụ, 121 triệu nhận sau hai năm có PV là 100 triệu nếu tỷ lệ chiết khấu 10%/năm, vì 100 × 1,1^2 = 121. Nếu cùng 121 triệu nhưng tỷ lệ yêu cầu 15%, PV chỉ còn khoảng 91,49 triệu. Đây là lý do rủi ro và thời gian ảnh hưởng mạnh đến giá trị.'
        ],
        tip: 'Chiết khấu không phải mẹo để làm một dự án trông tệ hơn. Nó là cách đặt tất cả tiền vào cùng thời điểm để so sánh công bằng.'
      },
      {
        h: '2. Tỷ lệ chiết khấu đại diện cho điều gì?',
        p: [
          'Tỷ lệ chiết khấu tối thiểu phải phản ánh lợi suất từ lựa chọn có rủi ro tương đương và mức bù cho rủi ro dòng tiền. Với một dự án rất an toàn, tỷ lệ có thể thấp hơn dự án có khách hàng chưa chắc, công nghệ mới hoặc thị trường biến động. Nó không đơn giản là lãi suất vay ngân hàng.',
          'Ở doanh nghiệp, tỷ lệ có thể được xác định bằng chi phí vốn, suất sinh lời yêu cầu của bộ phận hoặc mức chuẩn nội bộ. Với người học, điều quan trọng là nêu rõ cơ sở và kiểm tra độ nhạy. Chọn một số 12% chỉ vì nghe hợp lý mà không ghi lý do khiến kết luận khó bảo vệ.'
        ],
        list: [
          'Chi phí cơ hội: tiền có thể làm gì khác với rủi ro tương tự?',
          'Rủi ro dòng tiền: xác suất và mức độ sai lệch so với forecast.',
          'Phù hợp kỳ hạn và tiền tệ: không dùng tỷ lệ VND cho dòng tiền USD nếu chưa xem xét yếu tố liên quan.'
        ]
      },
      {
        h: '3. Giá trị hiện tại của nhiều dòng tiền',
        p: [
          'Dự án hiếm khi chỉ có một khoản thu. Với dòng tiền 50 triệu cuối năm 1, 70 triệu cuối năm 2 và 90 triệu cuối năm 3, PV tổng là tổng PV từng năm: 50/(1+r) + 70/(1+r)^2 + 90/(1+r)^3. Không được cộng thẳng 210 triệu rồi chiết khấu ba năm vì các khoản đến ở thời điểm khác nhau.',
          'Lập bảng có cột năm, dòng tiền, hệ số chiết khấu và giá trị hiện tại là cách ít lỗi nhất. Bảng giúp người đọc kiểm tra ngay tiền nào đã được đưa vào và thời điểm có đúng hay không.'
        ],
        tip: 'Dòng tiền cuối năm 0 không cần chiết khấu. Đây thường là chi đầu tư ban đầu và có dấu âm trong bảng NPV.'
      },
      {
        h: '4. Nhạy cảm với tỷ lệ chiết khấu',
        p: [
          'Một dự án có dòng tiền xa trong tương lai nhạy hơn với tỷ lệ chiết khấu so với dự án thu tiền sớm. Nếu kết luận đầu tư chỉ đúng khi dùng 10% nhưng chuyển 12% đã thành âm, đó là thông tin quản trị quan trọng: dự án biên mỏng và cần kiểm tra giả định hoặc giảm rủi ro trước khi phê duyệt.',
          'Đừng cố tìm một tỷ lệ đúng tuyệt đối. Hãy trình bày base case, low/high case và điều kiện nào khiến mỗi tỷ lệ phù hợp. Cách làm này minh bạch hơn và giúp quản lý thấy quyết định phụ thuộc vào điều gì.'
        ],
        list: [
          'Lập PV tại ít nhất ba mức tỷ lệ khi dự án lớn.',
          'Ghi rõ tỷ lệ là sau thuế hay trước thuế, danh nghĩa hay thực nếu bối cảnh yêu cầu.',
          'Giữ nhất quán giữa loại dòng tiền và tỷ lệ chiết khấu.'
        ]
      }
    ],
    keyPoints: [
      'PV quy đổi tiền tương lai về hiện tại: PV = FV / (1 + r)^n.',
      'Tỷ lệ chiết khấu phản ánh chi phí cơ hội và rủi ro, không chỉ lãi vay.',
      'Nhiều dòng tiền phải chiết khấu từng kỳ rồi cộng lại.',
      'Độ nhạy với tỷ lệ chiết khấu là thông tin quyết định, không phải phần phụ.'
    ],
    relatedTerms: ['Giá trị hiện tại', 'Chiết khấu', 'Chi phí cơ hội', 'Tỷ lệ yêu cầu', 'Độ nhạy', 'Dòng tiền'],
    tryIt: { text: 'Tính PV của 150 triệu nhận cuối năm 3 với r = 10%; sau đó so với r = 14% và giải thích vì sao kết quả thay đổi.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'nien-kim-va-dong-tien-deu',
    title: 'Bài 17 · Niên kim, vĩnh cửu và dòng tiền đều',
    level: 'Cơ bản',
    minutes: 26,
    chapter: 'Chương 5 · Giá trị thời gian của tiền',
    summary: 'Xử lý nhanh các khoản thu/chi đều theo kỳ, phân biệt trả cuối kỳ với đầu kỳ và biết khi nào mô hình vĩnh cửu phù hợp hay nguy hiểm.',
    sections: [
      {
        h: '1. Nhận diện dòng tiền đều',
        p: [
          'Niên kim là chuỗi các khoản tiền bằng nhau phát sinh trong một số kỳ hữu hạn, ví dụ thuê văn phòng trả 30 triệu cuối mỗi tháng trong 24 tháng hoặc nhận 100 triệu cuối mỗi năm trong 5 năm. Nếu khoản tiền xuất hiện cuối mỗi kỳ, đó là niên kim thông thường; nếu xuất hiện đầu kỳ, đó là niên kim đầu kỳ.',
          'Việc phân biệt đầu và cuối kỳ rất quan trọng. Cùng 30 triệu trong 24 tháng, trả đầu tháng có giá trị hiện tại cao hơn trả cuối tháng vì mỗi khoản rời khỏi doanh nghiệp sớm hơn một kỳ.'
        ],
        tip: 'Đọc hợp đồng để xác định ngày thanh toán thực tế. Trả hàng tháng chưa đủ để biết đầu hay cuối kỳ.'
      },
      {
        h: '2. Công thức chỉ là dạng rút gọn của bảng PV',
        p: [
          'Giá trị hiện tại của niên kim thông thường có thể tính bằng PMT × [1 - 1/(1+r)^n] / r. Giá trị tương lai có dạng PMT × [(1+r)^n - 1] / r. PMT là mỗi khoản thanh toán, r là tỷ lệ mỗi kỳ, n là số kỳ.',
          'Bạn nên hiểu công thức được tạo từ việc cộng từng khoản chiết khấu, chứ không cần tin nó như công thức thần chú. Khi dòng tiền không đều, có phí ban đầu, tăng giá theo năm hoặc trả vào kỳ khác, hãy quay lại bảng từng kỳ thay vì ép vào công thức niên kim.'
        ],
        list: [
          'Niên kim thông thường: dòng tiền ở cuối các kỳ.',
          'Niên kim đầu kỳ: lấy giá trị niên kim thông thường nhân (1 + r).',
          'Tỷ lệ và số kỳ phải dùng cùng đơn vị, ví dụ r tháng với n tháng.'
        ]
      },
      {
        h: '3. Dòng tiền vĩnh cửu và tăng trưởng',
        p: [
          'Dòng tiền vĩnh cửu giả định một khoản tiền đều kéo dài mãi mãi; PV = C/r trong trường hợp khoản tiền C ổn định và r lớn hơn 0. Đây là một mô hình khái quát, không có nghĩa doanh nghiệp thật sự không bao giờ kết thúc.',
          'Với dòng tiền tăng đều mãi mãi ở tốc độ g, mô hình thường dùng là PV = C1/(r-g), với điều kiện r > g. Chỉ cần chênh lệch r-g nhỏ là giá trị thay đổi rất mạnh, nên mô hình này nhạy và cần giả định tăng trưởng dài hạn thận trọng.'
        ],
        tip: 'Không dùng tăng trưởng vĩnh cửu cao hơn tốc độ tăng trưởng dài hạn bền vững của nền kinh tế chỉ để làm giá trị đẹp hơn. Hãy kiểm tra giả định r > g trước khi bấm máy.'
      },
      {
        h: '4. Ứng dụng: thuê, trả góp và quỹ định kỳ',
        p: [
          'Khi so thuê máy với mua máy, quy các khoản trả thuê và chi phí liên quan về cùng mốc hiện tại, rồi so với chi mua và giá trị còn lại. Không chỉ so tổng tiền danh nghĩa vì trả 50 triệu mỗi năm trong 5 năm khác với trả 250 triệu ngay hôm nay.',
          'Khi lập quỹ thay thế tài sản, dùng giá trị tương lai để biết khoản đóng góp định kỳ cần thiết. Ví dụ muốn có 500 triệu sau 5 năm, lãi 8% và đóng cuối mỗi năm, dùng công thức FV niên kim để suy ra số tiền cần gửi đều. Trong doanh nghiệp, hãy tính thêm tính chắc chắn của lợi suất và tính thanh khoản của quỹ.'
        ],
        list: [
          'Vẽ timeline trước, đánh dấu tất cả ngày thu/chi.',
          'Đưa mọi lựa chọn về PV hoặc FV tại cùng mốc.',
          'Nêu rõ phí, thuế, tăng giá và giá trị cuối kỳ nếu so phương án thực tế.'
        ]
      }
    ],
    keyPoints: [
      'Niên kim là dòng tiền bằng nhau trong số kỳ hữu hạn.',
      'Trả đầu kỳ có giá trị khác trả cuối kỳ.',
      'Công thức niên kim là dạng rút gọn của việc chiết khấu từng khoản.',
      'Mô hình vĩnh cửu/tăng trưởng rất nhạy, đặc biệt khi r gần g.'
    ],
    relatedTerms: ['Niên kim', 'Niên kim đầu kỳ', 'Niên kim cuối kỳ', 'Vĩnh cửu', 'Tăng trưởng vĩnh cửu', 'PMT'],
    tryIt: { text: 'Vẽ timeline cho khoản thuê trả 12 triệu vào cuối mỗi tháng trong 12 tháng và ghi tỷ lệ cần dùng nếu lãi suất là 12%/năm ghép tháng.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'lap-bang-dong-tien-va-quy-doi-ky',
    title: 'Bài 18 · Lập bảng dòng tiền và quy đổi kỳ',
    level: 'Ứng dụng',
    minutes: 28,
    chapter: 'Chương 5 · Giá trị thời gian của tiền',
    summary: 'Biến một đề bài lộn xộn thành bảng dòng tiền rõ ràng, xử lý thời điểm không tròn năm và phòng tránh những sai lầm công thức thường gặp.',
    sections: [
      {
        h: '1. Timeline là bước bắt buộc trước công thức',
        p: [
          'Khi nhận đề xuất có tiền đặt cọc, trả dần, thời gian lắp đặt, doanh thu tăng theo năm và tiền thanh lý, hãy vẽ trục thời gian trước. Đặt kỳ 0 là hôm nay, rồi ghi tất cả khoản thu/chi đúng lúc phát sinh. Bước này khiến các khoản bị bỏ sót hoặc nhầm dấu hiện ra trước khi Excel che chúng đi.',
          'Ví dụ, mua máy hôm nay 300 triệu, tốn lắp đặt 20 triệu sau một tháng, tạo tiền 12 triệu cuối mỗi tháng từ tháng thứ ba, và bán lại 40 triệu cuối tháng 24. Đây không còn là một công thức PV; nó là nhiều dòng tiền cần sắp xếp đúng thời điểm.'
        ],
        tip: 'Quy ước dấu từ đầu: tiền vào dương, tiền ra âm. Giữ quy ước này xuyên suốt cả file để không cộng nhầm một khoản chi như khoản thu.'
      },
      {
        h: '2. Quy đổi lãi suất và kỳ tính',
        p: [
          'Nếu dòng tiền theo tháng, hãy dùng tỷ lệ tháng nhất quán. Một cách gần đúng hay dùng với lãi suất danh nghĩa ghép tháng là r tháng = r năm / 12; với lãi hiệu dụng năm, tỷ lệ tháng tương đương là (1+r năm)^(1/12)-1. Phải biết hợp đồng hoặc giả định đang nói về loại nào.',
          'Ví dụ, tỷ lệ hiệu dụng năm 12% không bằng 1%/tháng chính xác. Tỷ lệ tháng tương đương là (1,12)^(1/12)-1, xấp xỉ 0,95%. Chênh lệch có thể không lớn trong một năm nhưng sẽ ảnh hưởng khi khoản tiền dài hoặc sát ngưỡng quyết định.'
        ],
        list: [
          'Dòng tiền tháng: dùng tỷ lệ tháng và số tháng.',
          'Dòng tiền quý: dùng tỷ lệ quý và số quý.',
          'Không nhân đơn giản lãi hiệu dụng năm với số tháng trừ khi đã nêu đó là xấp xỉ phù hợp.'
        ]
      },
      {
        h: '3. Bảng tính tối thiểu phải có gì?',
        p: [
          'Một bảng PV/NPV tối thiểu có cột: kỳ, ngày hoặc mô tả thời điểm, loại dòng tiền, số tiền, tỷ lệ/hệ số chiết khấu, giá trị hiện tại và ghi chú giả định. Nếu có nhiều nguồn tiền, dùng hàng tách riêng cho doanh thu, chi phí vận hành, thuế, vốn lưu động, CAPEX và giá trị thu hồi.',
          'Trong Excel, dùng ô giả định riêng thay vì gõ 10% lặp lại trong 15 công thức. Liên kết các công thức với ô giả định giúp kiểm tra nhạy cảm nhanh và giảm rủi ro một dòng dùng 10%, dòng khác vô tình dùng 12%.'
        ],
        tip: 'Tô màu hoặc đặt vùng rõ ràng cho ô nhập giả định. Người dùng file cần biết đâu là dữ liệu đầu vào, đâu là công thức và đâu là kết quả.'
      },
      {
        h: '4. Kiểm tra logic trước khi tin kết quả',
        p: [
          'Một vài kiểm tra nhanh: dòng tiền ở kỳ 0 có bị chiết khấu không; giá trị PV có nhỏ hơn dòng tiền danh nghĩa đối với khoản thu dương trong tương lai không; nếu tăng tỷ lệ chiết khấu thì PV của dòng tiền xa có giảm không; nếu đổi dấu toàn bộ thì kết quả có vô lý không.',
          'Bạn cũng cần kiểm tra đơn vị. Một cột ghi triệu đồng và một khoản CAPEX ghi đồng sẽ làm NPV sai hàng triệu lần dù công thức hoàn hảo. Luôn hiển thị đơn vị trong tiêu đề và làm một phép kiểm tra bằng ước lượng tay.'
        ],
        list: [
          'Kiểm tra mốc thời gian và dấu.',
          'Kiểm tra đơn vị, tiền tệ và thuế.',
          'Kiểm tra độ nhạy với lãi suất/dòng tiền.',
          'Kiểm tra kết quả bằng ước lượng độc lập đơn giản.'
        ]
      }
    ],
    keyPoints: [
      'Timeline và quy ước dấu là nền của mọi bài toán dòng tiền.',
      'Tỷ lệ chiết khấu phải cùng đơn vị thời gian với dòng tiền.',
      'Bảng tính tốt tách giả định, công thức và kết quả.',
      'Luôn kiểm tra mốc, dấu, đơn vị và độ nhạy trước khi kết luận.'
    ],
    relatedTerms: ['Timeline', 'Quy đổi kỳ', 'Lãi suất hiệu dụng', 'Hệ số chiết khấu', 'NPV', 'Kiểm tra logic'],
    tryIt: { text: 'Lập timeline 0-3 năm cho dự án chi 200 hôm nay, nhận 90 cuối mỗi năm và thu hồi 20 cuối năm 3; ghi rõ dấu của từng khoản.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'trai-phieu-va-lai-suat-thi-truong',
    title: 'Bài 19 · Trái phiếu, coupon và lợi suất thị trường',
    level: 'Cơ bản',
    minutes: 25,
    chapter: 'Chương 6 · Định giá trái phiếu và cổ phiếu',
    summary: 'Hiểu trái phiếu là một hợp đồng vay, phân biệt mệnh giá, coupon, giá thị trường và lợi suất; từ đó không nhầm lãi coupon với lợi nhuận thực tế của nhà đầu tư.',
    sections: [
      {
        h: '1. Một trái phiếu thực chất là gì?',
        p: [
          'Khi mua trái phiếu, nhà đầu tư cho tổ chức phát hành vay tiền. Tổ chức cam kết trả lãi theo điều khoản và hoàn gốc vào ngày đáo hạn, trừ khi xảy ra rủi ro tín dụng. Khác với cổ đông, trái chủ thường không sở hữu doanh nghiệp và có quyền ưu tiên cao hơn cổ đông khi thanh lý theo thứ tự pháp lý áp dụng.',
          'Các thuật ngữ cơ bản gồm mệnh giá (số gốc hoàn lại theo hợp đồng), coupon (lãi định kỳ theo tỷ lệ trên mệnh giá), ngày đáo hạn, tần suất trả lãi và điều khoản có thể mua lại/trả trước. Hãy đọc điều khoản thay vì giả định mọi trái phiếu giống nhau.'
        ],
        tip: 'Một con số “10%/năm” chưa đủ thông tin. Hỏi ngay: tính trên mệnh giá hay giá mua, trả mấy lần/năm, đáo hạn khi nào, có tài sản bảo đảm không và ai phát hành?'
      },
      {
        h: '2. Coupon khác lợi suất đến đáo hạn',
        p: [
          'Coupon rate là tỷ lệ lãi ghi trên mệnh giá. Trái phiếu mệnh giá 100 triệu, coupon 8% trả hàng năm sẽ trả 8 triệu/năm nếu không có điều khoản khác. Nhưng nếu mua trái phiếu đó ở giá 95 triệu, lợi suất của người mua không chỉ là 8/95 vì họ còn có khoản chênh 5 triệu khi nhận lại 100 triệu lúc đáo hạn.',
          'Lợi suất đến đáo hạn (YTM) là tỷ lệ chiết khấu làm giá hiện tại bằng tổng PV của coupon và mệnh giá còn lại, với giả định giữ đến đáo hạn và nhận đủ các dòng tiền. Nó là một công cụ so sánh, không phải bảo đảm lợi nhuận nếu người mua bán trước đáo hạn hoặc tổ chức phát hành không trả được nợ.'
        ],
        list: [
          'Coupon: tiền lãi hợp đồng dựa trên mệnh giá.',
          'Current yield: coupon năm / giá thị trường hiện tại, bỏ qua lãi/lỗ vốn đến đáo hạn.',
          'YTM: lợi suất nội bộ của toàn bộ dòng tiền nếu các giả định được đáp ứng.'
        ]
      },
      {
        h: '3. Quan hệ giữa lãi suất và giá trái phiếu',
        p: [
          'Khi lợi suất thị trường yêu cầu tăng, giá của trái phiếu coupon cố định thường giảm; khi lợi suất yêu cầu giảm, giá thường tăng. Lý do là coupon cũ trở nên kém/hấp dẫn hơn so với mức lợi suất mới, nên giá phải điều chỉnh để tổng lợi suất của người mua phù hợp thị trường.',
          'Ví dụ, trái phiếu trả coupon 8% sẽ hấp dẫn hơn khi trái phiếu mới cùng rủi ro chỉ trả 6%; người mua có thể trả giá cao hơn mệnh giá. Nếu thị trường đòi 10%, trái phiếu 8% cần bán thấp hơn mệnh giá để bù chênh. Đây là quan hệ giá-lợi suất nghịch chiều.'
        ],
        tip: 'Giá trái phiếu có thể biến động trước đáo hạn. Giữ đến đáo hạn giảm rủi ro giá do lãi suất, nhưng không xóa rủi ro tín dụng, thanh khoản hay trả trước.'
      },
      {
        h: '4. Rủi ro cần đọc cùng lợi suất',
        p: [
          'Lợi suất cao thường là khoản bù cho rủi ro cao hơn, không phải món quà miễn phí. Rủi ro tín dụng là khả năng chậm/trễ hoặc không trả. Rủi ro lãi suất là giá giảm khi lợi suất thị trường tăng. Rủi ro thanh khoản là khó bán đúng giá. Ngoài ra còn rủi ro tái đầu tư coupon và rủi ro điều khoản mua lại sớm.',
          'Khi đánh giá trái phiếu doanh nghiệp, xem dòng tiền của tổ chức phát hành, nợ đến hạn, tài sản bảo đảm, thứ tự ưu tiên, cam kết trong hợp đồng và mức độ phù hợp của trái phiếu với nhu cầu tiền của bạn. Không mua chỉ vì coupon cao hơn lãi gửi.'
        ],
        list: [
          'So sánh lợi suất với rủi ro và thời hạn tương đương.',
          'Đọc điều khoản phát hành, tài sản bảo đảm và quyền của trái chủ.',
          'Không dùng tiền cần thanh toán gần để mua công cụ có thanh khoản không chắc chắn.'
        ]
      }
    ],
    keyPoints: [
      'Trái phiếu là quan hệ vay nợ với các dòng tiền và điều khoản xác định.',
      'Coupon, current yield và YTM là ba khái niệm khác nhau.',
      'Lợi suất thị trường tăng thường làm giá trái phiếu coupon cố định giảm.',
      'Lợi suất cao cần được đọc cùng rủi ro tín dụng, lãi suất và thanh khoản.'
    ],
    relatedTerms: ['Trái phiếu', 'Mệnh giá', 'Coupon', 'YTM', 'Current yield', 'Rủi ro tín dụng'],
    tryIt: { text: 'Liệt kê năm thông tin phải có trước khi so sánh hai trái phiếu đều ghi coupon 9%/năm.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'dinh-gia-trai-phieu-va-rui-ro-lai-suat',
    title: 'Bài 20 · Định giá trái phiếu và rủi ro lãi suất',
    level: 'Cơ bản',
    minutes: 30,
    chapter: 'Chương 6 · Định giá trái phiếu và cổ phiếu',
    summary: 'Tự lập bảng PV của trái phiếu, hiểu giá premium/discount và nhận biết tại sao trái phiếu dài hạn thường nhạy với lãi suất hơn.',
    sections: [
      {
        h: '1. Giá trái phiếu là tổng giá trị hiện tại của các cam kết',
        p: [
          'Với trái phiếu coupon cố định, giá lý thuyết bằng PV của từng coupon cộng PV của mệnh giá nhận ở đáo hạn. Trái phiếu mệnh giá 100 triệu, coupon 8% trả cuối mỗi năm trong ba năm sẽ có ba khoản coupon 8 triệu và một khoản gốc 100 triệu ở cuối năm ba.',
          'Nếu lợi suất yêu cầu là 8%, giá sẽ xấp xỉ mệnh giá vì coupon đúng bằng mức thị trường yêu cầu. Nếu lợi suất yêu cầu 10%, chiết khấu các khoản đó ở 10% sẽ cho giá thấp hơn 100 triệu. Nếu lợi suất yêu cầu 6%, giá cao hơn 100 triệu.'
        ],
        tip: 'Đừng quên kỳ coupon. Coupon 8% trả nửa năm có dòng tiền và tỷ lệ mỗi kỳ khác coupon 8% trả một lần/năm.'
      },
      {
        h: '2. Premium, par và discount',
        p: [
          'Trái phiếu giao dịch premium khi giá cao hơn mệnh giá, thường vì coupon cao hơn lợi suất yêu cầu hiện tại. Giao dịch par khi hai tỷ lệ tương đương. Giao dịch discount khi coupon thấp hơn lợi suất yêu cầu hoặc nhà đầu tư đòi phần bù rủi ro lớn hơn.',
          'Giá trái phiếu coupon cố định sẽ tiến về mệnh giá khi gần đáo hạn nếu các điều kiện không đổi, vì khoản gốc nhận cuối cùng vẫn là mệnh giá. Điều này không có nghĩa ai mua premium chắc chắn lỗ hoặc mua discount chắc chắn lãi; coupon, thời gian giữ và lãi suất thay đổi đều ảnh hưởng tổng kết quả.'
        ],
        list: [
          'Coupon > YTM: thường premium.',
          'Coupon = YTM: thường gần par.',
          'Coupon < YTM: thường discount.'
        ]
      },
      {
        h: '3. Vì sao thời hạn và coupon làm độ nhạy khác nhau?',
        p: [
          'Một trái phiếu dài hạn nhận phần lớn tiền rất xa trong tương lai, nên PV của nó bị tác động mạnh hơn khi lãi suất thay đổi. Trái phiếu coupon thấp cũng thường nhạy hơn vì người mua nhận ít tiền sớm và phụ thuộc nhiều vào gốc cuối kỳ. Đây là trực giác phía sau duration, một thước đo độ nhạy giá với lợi suất.',
          'Ví dụ, hai trái phiếu cùng mệnh giá và rủi ro, nhưng một trái phiếu đáo hạn hai năm, một đáo hạn mười năm. Khi lợi suất thị trường tăng 1 điểm phần trăm, giá trái phiếu mười năm thường giảm mạnh hơn. Đây là lý do không nên đánh giá rủi ro chỉ qua coupon.'
        ],
        tip: 'Duration là xấp xỉ hữu ích cho thay đổi nhỏ của lợi suất, không phải dự báo giá chính xác trong mọi tình huống. Độ cong giá-lợi suất và điều khoản đặc biệt cũng quan trọng.'
      },
      {
        h: '4. Mô hình thực hành an toàn',
        p: [
          'Trong bảng tính, tạo một hàng cho từng kỳ coupon, ghi coupon, gốc, tổng dòng tiền, hệ số chiết khấu và PV. Sau đó dùng ba kịch bản lợi suất để xem giá đổi khi r tăng/giảm. Đây là cách học trực quan hơn việc chỉ nhớ quan hệ nghịch chiều.',
          'Khi dùng dữ liệu thật, giá có thể khác mô hình đơn giản do lãi tích lũy, ngày thanh toán, quyền mua lại, quyền chuyển đổi, rủi ro tín dụng và thanh khoản. Hãy ghi rõ mô hình đang bỏ qua điều gì trước khi dùng kết quả để khuyến nghị.'
        ],
        list: [
          'Dùng tỷ lệ mỗi kỳ, không lẫn tỷ lệ năm và coupon nửa năm.',
          'Tách giá sạch, lãi tích lũy và giá thanh toán nếu giao dịch thực tế yêu cầu.',
          'Thử độ nhạy +/- 1% lợi suất và ghi nhận giới hạn mô hình.'
        ]
      }
    ],
    keyPoints: [
      'Giá trái phiếu là PV coupon cộng PV mệnh giá.',
      'Premium/discount phản ánh quan hệ coupon với lợi suất yêu cầu.',
      'Trái phiếu dài hạn và coupon thấp thường nhạy lãi suất hơn.',
      'Bảng dòng tiền từng kỳ là cách định giá ít lỗi và dễ kiểm tra.'
    ],
    relatedTerms: ['Giá trái phiếu', 'Premium', 'Discount', 'Par', 'Duration', 'Lãi tích lũy'],
    tryIt: { text: 'Lập bảng ba năm cho trái phiếu mệnh giá 100, coupon 8%/năm và chiết khấu 10%; không cần dùng công thức tắt.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'dinh-gia-co-phieu-bang-co-tuc',
    title: 'Bài 21 · Định giá cổ phiếu bằng cổ tức và kỳ vọng',
    level: 'Cơ bản',
    minutes: 30,
    chapter: 'Chương 6 · Định giá trái phiếu và cổ phiếu',
    summary: 'Hiểu cổ phiếu là quyền nhận dòng tiền còn lại, dùng mô hình cổ tức như một khung suy nghĩ về tăng trưởng/rủi ro và biết các giới hạn của mô hình.',
    sections: [
      {
        h: '1. Cổ đông nhận gì sau cùng?',
        p: [
          'Cổ đông phổ thông nhận phần giá trị còn lại sau khi doanh nghiệp trả nghĩa vụ cho người lao động, nhà cung cấp, cơ quan thuế và chủ nợ. Dòng tiền cho cổ đông có thể đến dưới dạng cổ tức, mua lại cổ phần hoặc giá trị tăng do lợi nhuận được giữ lại để tái đầu tư hiệu quả.',
          'Vì dòng tiền cho cổ đông không cố định như coupon trái phiếu, định giá cổ phiếu chứa nhiều giả định hơn: lợi nhuận tương lai, chính sách giữ lại lợi nhuận, tăng trưởng, rủi ro và tỷ suất sinh lời yêu cầu. Kết quả định giá là một khoảng có điều kiện, không phải con số chắc chắn.'
        ],
        tip: 'Giá cổ phiếu thấp không tự động rẻ; giá cao không tự động đắt. Hãy so giá với dòng tiền, tăng trưởng, rủi ro và chất lượng quản trị kỳ vọng.'
      },
      {
        h: '2. Mô hình tăng trưởng ổn định',
        p: [
          'Nếu cổ tức năm tới là D1, tăng trưởng dài hạn ổn định là g và tỷ suất sinh lời yêu cầu là r, mô hình Gordon viết P0 = D1 / (r - g), với điều kiện r > g. Mô hình nêu rõ trực giác: cổ tức cao hơn hoặc tăng trưởng cao hơn làm giá trị tăng, còn tỷ suất yêu cầu cao hơn làm giá trị giảm.',
          'Ví dụ, D1 = 2.000 đồng/cổ phiếu, r = 12%, g = 5% thì giá trị ước tính là 2.000/(12%-5%) = khoảng 28.571 đồng. Nếu r tăng lên 13% trong khi g không đổi, giá trị giảm đáng kể. Đó là độ nhạy tự nhiên của các giả định dài hạn.'
        ],
        list: [
          'D1 là cổ tức kỳ tới, không nhất thiết là cổ tức vừa trả.',
          'r phản ánh tỷ suất yêu cầu tương ứng rủi ro cổ phiếu.',
          'g phải bền vững dài hạn và nhỏ hơn r trong mô hình.'
        ]
      },
      {
        h: '3. Khi nào mô hình cổ tức phù hợp?',
        p: [
          'Mô hình ổn định phù hợp hơn với doanh nghiệp trưởng thành có chính sách cổ tức tương đối dễ dự báo và tăng trưởng ổn định. Nó ít phù hợp trực tiếp với startup, doanh nghiệp đang tái đầu tư mạnh không trả cổ tức, hoặc công ty có lợi nhuận biến động lớn. Không nên ép một mô hình đơn giản vào mọi công ty chỉ vì công thức dễ tính.',
          'Với doanh nghiệp không trả cổ tức, bạn có thể học các cách tiếp cận khác như dòng tiền tự do cho doanh nghiệp/cổ đông hoặc so sánh bội số, nhưng vẫn quay về cùng nền tảng: dòng tiền, tăng trưởng, rủi ro và tỷ lệ yêu cầu. Mô hình thay đổi, logic giá trị không thay đổi.'
        ],
        tip: 'Giả định tăng trưởng vĩnh cửu 10% có thể làm giá trị tăng vọt, nhưng hầu hết doanh nghiệp không thể tăng nhanh hơn nền kinh tế mãi mãi. Hãy giải thích vì sao g hợp lý thay vì chỉ nhập số cao.'
      },
      {
        h: '4. Viết định giá như một tập hợp giả định',
        p: [
          'Một file định giá nên công khai D1 lấy từ đâu, g dựa trên tái đầu tư/khả năng thị trường nào, r được xác định thế nào và kịch bản thay đổi khi giả định sai. Kết quả tốt là một bảng sensitivity cho r và g, không phải một ô giá màu xanh khẳng định chắc chắn.',
          'Ví dụ, nếu giá trị nằm trong khoảng 24.000-31.000 đồng tùy r/g hợp lý còn giá thị trường là 40.000, câu hỏi tiếp theo là thị trường đang kỳ vọng tăng trưởng/rủi ro gì. Định giá giúp bạn biết câu hỏi cần kiểm tra, không phải thay bạn dự đoán giá ngày mai.'
        ],
        list: [
          'Base case: giả định trung tâm có lý do.',
          'Upside/downside: thay đổi có căn cứ của tăng trưởng và tỷ suất yêu cầu.',
          'Điều kiện sai: dữ liệu nào sẽ khiến bạn sửa mô hình?'
        ]
      }
    ],
    keyPoints: [
      'Cổ phiếu là quyền đối với dòng tiền còn lại, nên có rủi ro và giả định cao hơn trái phiếu.',
      'Mô hình Gordon: P0 = D1/(r-g), yêu cầu r > g.',
      'Mô hình cổ tức không phù hợp trực tiếp với mọi doanh nghiệp.',
      'Định giá tốt trình bày giả định và khoảng nhạy cảm, không khẳng định một giá chắc chắn.'
    ],
    relatedTerms: ['Cổ tức', 'Tỷ suất yêu cầu', 'Tăng trưởng ổn định', 'Gordon growth', 'Dòng tiền tự do', 'Sensitivity'],
    tryIt: { text: 'Tính giá trị Gordon với D1 = 1.500 đồng, r = 11%, g = 4%; sau đó nêu một lý do g có thể không bền vững.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'quy-trinh-ra-quyet-dinh-dau-tu-von',
    title: 'Bài 22 · Quy trình ra quyết định đầu tư vốn',
    level: 'Ứng dụng',
    minutes: 26,
    chapter: 'Chương 7 · Kỹ thuật phân tích dự án đầu tư',
    summary: 'Đi từ ý tưởng CAPEX đến hồ sơ quyết định có owner, giả định, dòng tiền, rủi ro và cơ chế theo dõi sau đầu tư.',
    sections: [
      {
        h: '1. Đầu tư vốn không bắt đầu ở NPV',
        p: [
          'Một dự án có thể xuất phát từ cơ hội tăng doanh thu, nhu cầu thay thế máy cũ, yêu cầu an toàn/pháp lý, cắt giảm chi phí hoặc bảo vệ năng lực cạnh tranh. Trước khi mở file NPV, xác định vấn đề kinh doanh, các phương án khả thi và điều gì xảy ra nếu không làm gì.',
          'Không làm gì là một phương án chuẩn để so sánh, không phải khoảng trống. Ví dụ, nếu máy cũ vẫn hoạt động nhưng sửa chữa 15 triệu/tháng và gây dừng máy, phương án cơ sở phải bao gồm các dòng tiền đó. Dự án mới chỉ được đánh giá trên phần thay đổi so với cơ sở.'
        ],
        tip: 'Một đề xuất “mua máy vì máy cũ” chưa phải business case. Hãy nêu vấn đề định lượng: chi phí sửa, sản lượng mất, rủi ro, yêu cầu chất lượng và thời gian.'
      },
      {
        h: '2. Các bước của một business case',
        p: [
          'Business case tốt không chỉ có bảng tính. Nó mô tả phạm vi, chủ dự án, phương án thay thế, CAPEX, lịch triển khai, giả định vận hành, forecast dòng tiền, tỷ lệ chiết khấu, NPV/IRR phù hợp, rủi ro, phương án giảm rủi ro và quyết định cần phê duyệt.',
          'Ví dụ, mở kho mới cần tách tiền đặt cọc, xây dựng, thiết bị, tuyển dụng trước khai trương, doanh thu ramp-up, chi phí vận hành, tồn kho tăng và giá trị còn lại. Những khoản bị bỏ quên thường chính là phần làm dự án từ dương thành âm.'
        ],
        list: [
          'Xác định nhu cầu và phương án cơ sở.',
          'Xây dựng dòng tiền chênh lệch và giả định.',
          'Đánh giá NPV, rủi ro, độ nhạy và khả năng tài trợ.',
          'Phê duyệt, triển khai, theo dõi post-investment review.'
        ]
      },
      {
        h: '3. Dữ liệu và trách nhiệm',
        p: [
          'Finance không nên tự bịa số tiết kiệm vận hành. Bộ phận vận hành xác nhận công suất, kỹ thuật xác nhận tuổi thọ/bảo trì, procurement xác nhận giá và điều khoản, sales xác nhận nhu cầu, HR xác nhận lao động, legal xác nhận tuân thủ. Finance điều phối giả định, kiểm tra tính nhất quán và lượng hóa tác động tài chính.',
          'Mỗi giả định cần người sở hữu, nguồn và ngày xác nhận. Doanh thu tăng 20% không có nguồn không phải forecast; đó là một giả định rủi ro cao. Gắn owner giúp ban phê duyệt biết phải chất vấn ai và ai cập nhật khi thực tế khác kế hoạch.'
        ],
        tip: 'Dùng bảng giả định có cột: giả định, giá trị, nguồn, owner, mức chắc chắn, ngày cập nhật và tác động NPV. Đây là công cụ quản trị rủi ro đơn giản nhưng rất mạnh.'
      },
      {
        h: '4. Sau phê duyệt: học từ thực tế',
        p: [
          'Dự án không kết thúc khi ký phê duyệt. Sau một khoảng đủ để vận hành ổn định, so CAPEX thực tế, ngày triển khai, doanh thu/tiết kiệm, vốn lưu động và NPV cập nhật với hồ sơ ban đầu. Mục tiêu không phải truy lỗi cá nhân mà là cải thiện giả định, quy trình và quyết định lần sau.',
          'Nếu dự án trễ ba tháng, tiền vào bị lùi trong khi tiền ra có thể đã phát sinh. Nếu phát hiện sớm, doanh nghiệp có thể điều chỉnh kế hoạch tiền hoặc giảm phạm vi. Theo dõi sau đầu tư là nơi tài chính thực sự bảo vệ giá trị.'
        ],
        list: [
          'Theo dõi milestone, CAPEX, lợi ích và các giả định trọng yếu.',
          'Cập nhật forecast khi có dữ liệu mới, không đợi dự án kết thúc.',
          'Lưu bài học thành checklist cho dự án tương lai.'
        ]
      }
    ],
    keyPoints: [
      'Một business case bắt đầu từ vấn đề và phương án cơ sở, không phải từ công thức NPV.',
      'Dòng tiền dự án là phần thay đổi so với phương án không làm gì.',
      'Mỗi giả định cần nguồn, owner và mức chắc chắn.',
      'Theo dõi sau đầu tư biến sai khác thành bài học và hành động sớm.'
    ],
    relatedTerms: ['Business case', 'CAPEX', 'Baseline', 'Phương án cơ sở', 'Post-investment review', 'Owner'],
    tryIt: { text: 'Viết hai phương án cho đề xuất thay máy: không làm gì và mua máy mới, rồi nêu ba giả định phải lấy từ bộ phận khác.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'npv-irr-va-chi-so-sinh-loi',
    title: 'Bài 23 · NPV, IRR và chỉ số sinh lời',
    level: 'Ứng dụng',
    minutes: 32,
    chapter: 'Chương 7 · Kỹ thuật phân tích dự án đầu tư',
    summary: 'Dùng NPV làm nguyên tắc tạo giá trị, hiểu IRR và profitability index là chỉ số bổ sung, đồng thời biết các trường hợp công cụ có thể dẫn đến kết luận khác nhau.',
    sections: [
      {
        h: '1. NPV trả lời câu hỏi nào?',
        p: [
          'Giá trị hiện tại ròng, NPV, bằng tổng giá trị hiện tại của các dòng tiền dự án gồm cả khoản đầu tư ban đầu. Nếu NPV dương ở tỷ lệ chiết khấu phù hợp, dự án được kỳ vọng tạo giá trị vượt mức sinh lời yêu cầu. Nếu NPV âm, dự án không bù được chi phí cơ hội và rủi ro theo giả định đã dùng.',
          'Ví dụ, chi 200 triệu hôm nay, nhận 90 triệu cuối mỗi năm trong ba năm, tỷ lệ 10%. PV các khoản thu khoảng 223,8 triệu, NPV khoảng 23,8 triệu. Con số dương không phải lời hứa; nó nói rằng với forecast và tỷ lệ đang dùng, dự án có biên tạo giá trị.'
        ],
        tip: 'NPV chỉ đáng tin bằng dòng tiền và tỷ lệ chiết khấu. Đừng dùng NPV để che giả định không kiểm chứng; hãy cho người đọc thấy giả định có thể làm NPV đổi dấu.'
      },
      {
        h: '2. IRR hữu ích nhưng không phải ông chủ',
        p: [
          'IRR là tỷ lệ chiết khấu khiến NPV bằng 0. Nếu IRR cao hơn tỷ suất yêu cầu, dự án thường đạt tiêu chí chấp nhận khi dòng tiền bình thường gồm chi ban đầu rồi thu dương sau đó. IRR dễ truyền đạt như một tỷ lệ phần trăm, nhưng có nhiều hạn chế.',
          'Dòng tiền đổi dấu nhiều lần có thể tạo nhiều IRR hoặc không có IRR rõ ràng. IRR cũng ngầm giả định dòng tiền giữa kỳ được tái đầu tư ở chính IRR, điều có thể không thực tế. Khi các dự án loại trừ nhau khác quy mô hoặc thời điểm tiền, dự án IRR cao hơn chưa chắc tạo NPV lớn hơn.'
        ],
        list: [
          'Ưu tiên NPV khi mục tiêu là tối đa hóa giá trị.',
          'Dùng IRR như chỉ số giao tiếp/bổ sung, kèm giới hạn.',
          'Kiểm tra dạng dòng tiền trước khi tin kết quả IRR trong Excel.'
        ]
      },
      {
        h: '3. Profitability index và hạn chế vốn',
        p: [
          'Chỉ số sinh lời PI thường được tính bằng PV dòng tiền vào chia khoản đầu tư ban đầu, hoặc 1 + NPV/đầu tư ban đầu. PI lớn hơn 1 tương ứng NPV dương trong trường hợp chuẩn. Nó hữu ích khi doanh nghiệp có ngân sách vốn giới hạn và muốn xem giá trị tạo ra trên mỗi đồng đầu tư.',
          'Tuy nhiên PI không thay thế NPV nếu chỉ được chọn một dự án lớn hoặc một dự án nhỏ mà hai dự án loại trừ nhau. Dự án nhỏ có PI 1,4 nhưng tạo NPV 20 triệu có thể kém giá trị tuyệt đối so với dự án lớn PI 1,2 tạo NPV 100 triệu, tùy khả năng tài trợ và ràng buộc khác.'
        ],
        tip: 'Khi vốn bị giới hạn, đừng chỉ sắp PI rồi chọn tự động. Xem các dự án có chia sẻ nguồn lực, phụ thuộc lẫn nhau hoặc bắt buộc về pháp lý không.'
      },
      {
        h: '4. Cách trình bày quyết định đầu tư',
        p: [
          'Một bản đề xuất nên ghi NPV tại base case, IRR nếu phù hợp, số vốn cần, thời gian triển khai, điểm hòa vốn tiền, các biến nhạy cảm nhất và điều kiện phê duyệt. Ví dụ: chỉ phê duyệt nếu giá mua không vượt 2 tỷ, sản lượng tối thiểu 80% forecast và hợp đồng bảo trì được ký trước khi triển khai.',
          'Quản lý cần biết dự án có thể chấp nhận trong điều kiện nào, không chỉ một tỷ lệ IRR đẹp. Hãy dùng NPV để so giá trị, dùng kịch bản để nhìn rủi ro và dùng điều kiện để biến phân tích thành quản trị.'
        ],
        list: [
          'Nêu tỷ lệ chiết khấu và nguồn của nó.',
          'Nêu các giả định tác động mạnh nhất đến NPV.',
          'Nêu hành động giảm rủi ro hoặc ngưỡng dừng dự án.'
        ]
      }
    ],
    keyPoints: [
      'NPV dương tại tỷ lệ phù hợp nghĩa là dự án kỳ vọng tạo giá trị vượt yêu cầu.',
      'IRR là chỉ số bổ sung, có thể gây hiểu nhầm với dòng tiền bất thường hoặc dự án loại trừ nhau.',
      'PI hữu ích khi vốn hạn chế nhưng không thay thế NPV tuyệt đối.',
      'Quyết định tốt trình bày giá trị, rủi ro, giả định và điều kiện phê duyệt.'
    ],
    relatedTerms: ['NPV', 'IRR', 'Profitability index', 'Capital rationing', 'Tỷ lệ chiết khấu', 'Dự án loại trừ nhau'],
    tryIt: { text: 'Với chi 100 hôm nay và thu 45, 45, 45 cuối ba năm tại 10%, lập bảng PV và nêu NPV dương/âm trước khi dùng hàm Excel.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'thoi-gian-hoan-von-va-phan-tich-nhay-cam',
    title: 'Bài 24 · Hoàn vốn, độ nhạy và kịch bản dự án',
    level: 'Ứng dụng',
    minutes: 28,
    chapter: 'Chương 7 · Kỹ thuật phân tích dự án đầu tư',
    summary: 'Dùng thời gian hoàn vốn như thước đo thanh khoản bổ sung, sau đó mở rộng NPV bằng phân tích nhạy cảm và kịch bản để tránh quyết định dựa trên một forecast duy nhất.',
    sections: [
      {
        h: '1. Thời gian hoàn vốn cho biết gì và không cho biết gì?',
        p: [
          'Payback period là thời gian cần để dòng tiền thu hồi khoản đầu tư ban đầu. Nếu chi 240 triệu và tạo 60 triệu tiền mỗi năm đều, hoàn vốn đơn giản là bốn năm. Nó trực quan, hỗ trợ đánh giá thanh khoản và hữu ích khi rủi ro xa hạn cao.',
          'Nhưng payback đơn giản bỏ qua giá trị thời gian của tiền và dòng tiền sau mốc hoàn vốn. Một dự án hoàn vốn nhanh có thể tạo rất ít giá trị sau đó; một dự án hoàn vốn chậm hơn có thể có NPV cao. Vì vậy không nên dùng payback làm tiêu chí tạo giá trị duy nhất.'
        ],
        tip: 'Nếu doanh nghiệp có ngưỡng hoàn vốn vì hạn chế thanh khoản, hãy ghi rõ nó là ràng buộc quản trị, không gọi nó là bằng chứng dự án có NPV cao.'
      },
      {
        h: '2. Hoàn vốn chiết khấu cải thiện điều gì?',
        p: [
          'Discounted payback dùng dòng tiền đã chiết khấu trước khi cộng dồn, nên thừa nhận tiền tương lai có giá trị thấp hơn. Thời gian hoàn vốn chiết khấu luôn bằng hoặc dài hơn hoàn vốn đơn giản khi tỷ lệ chiết khấu dương.',
          'Tuy nhiên nó vẫn không tính giá trị dòng tiền sau khi hoàn vốn. Hãy dùng nó để trả lời mất bao lâu để thu hồi vốn theo giá trị hiện tại, rồi vẫn dùng NPV để trả lời dự án tạo bao nhiêu giá trị tổng cộng.'
        ],
        list: [
          'Payback: theo dõi thanh khoản và mức phơi nhiễm ban đầu.',
          'Discounted payback: thêm giá trị thời gian của tiền.',
          'NPV: đánh giá giá trị của toàn bộ vòng đời dự án.'
        ]
      },
      {
        h: '3. Phân tích nhạy cảm một biến',
        p: [
          'Phân tích nhạy cảm thay đổi một giả định trong khi giữ các giả định khác, ví dụ giá bán -5%, sản lượng -10%, CAPEX +15%, ngày triển khai trễ ba tháng hoặc tỷ lệ chiết khấu +2%. Mục tiêu là nhận diện biến nào làm NPV biến động mạnh nhất để ưu tiên xác minh và giảm rủi ro.',
          'Ví dụ, nếu NPV base case 120 triệu, CAPEX tăng 10% chỉ giảm NPV 15 triệu nhưng sản lượng giảm 10% làm NPV giảm 130 triệu, đội dự án cần tập trung vào bằng chứng nhu cầu/đơn hàng hơn là tranh luận nhỏ về giá thiết bị.'
        ],
        tip: 'Không thay đổi tất cả biến cùng lúc trong sensitivity một chiều; khi đó bạn không biết biến nào đang tác động. Dùng kịch bản để thay đổi một nhóm giả định nhất quán.'
      },
      {
        h: '4. Kịch bản và quyết định dưới bất định',
        p: [
          'Kịch bản base/upside/downside ghép các giả định có khả năng đi cùng nhau: nhu cầu thấp có thể đi kèm giá bán giảm và thời gian thu tiền dài; upside có thể có ramp-up nhanh hơn nhưng cũng cần căn cứ. Đừng xây kịch bản chỉ để tạo ba con số đẹp cách đều nhau.',
          'Một quyết định trưởng thành có thể là phê duyệt theo giai đoạn, thí điểm nhỏ, ký hợp đồng có điều khoản chia rủi ro hoặc hoãn đến khi có bằng chứng. Finance không chỉ nói đầu tư/không đầu tư; finance có thể thiết kế cách đầu tư để giới hạn thiệt hại khi forecast sai.'
        ],
        list: [
          'Xác định biến trọng yếu và chủ sở hữu bằng chứng.',
          'Lập bảng NPV theo mức thay đổi hợp lý.',
          'Đề xuất hành động giảm rủi ro hoặc điểm dừng theo kịch bản xấu.'
        ]
      }
    ],
    keyPoints: [
      'Payback đo thời gian thu hồi vốn, không đo đầy đủ giá trị tạo ra.',
      'Discounted payback có giá trị thời gian nhưng vẫn không thay NPV.',
      'Sensitivity tìm biến chi phối kết quả; scenario mô tả tổ hợp giả định nhất quán.',
      'Có thể quản trị rủi ro bằng đầu tư theo giai đoạn và điều kiện dừng.'
    ],
    relatedTerms: ['Payback period', 'Discounted payback', 'Sensitivity analysis', 'Scenario analysis', 'Break-even', 'Stage gate'],
    tryIt: { text: 'Một dự án chi 300, thu 80 mỗi năm trong 5 năm: tính payback đơn giản và ghi một lý do không nên quyết định chỉ dựa vào con số đó.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'dong-tien-chenh-lech-va-chi-phi-chim',
    title: 'Bài 25 · Dòng tiền chênh lệch, chi phí chìm và chi phí cơ hội',
    level: 'Ứng dụng',
    minutes: 28,
    chapter: 'Chương 8 · Xác định dòng tiền trong quyết định đầu tư',
    summary: 'Chọn đúng dòng tiền cho dự án bằng nguyên tắc độc lập và chênh lệch; loại chi phí chìm nhưng không bỏ sót chi phí cơ hội, tác động phụ và phần vốn lưu động.',
    sections: [
      {
        h: '1. Chỉ lấy dòng tiền thay đổi vì dự án',
        p: [
          'Nguyên tắc stand-alone yêu cầu nhìn dự án như một đơn vị tạo dòng tiền riêng, nhưng chỉ ghi những dòng tiền thay đổi khi doanh nghiệp chọn dự án. Lương của nhân viên đã có sẵn và vẫn phải trả dù có hay không có dự án thường không phải chi phí tăng thêm, trừ khi dự án làm phát sinh làm thêm, tuyển mới hoặc bỏ lỡ công việc khác.',
          'Ví dụ, mở kênh bán online có thể tạo doanh thu mới 500 triệu nhưng lấy mất 100 triệu doanh thu tại cửa hàng. Phần dòng tiền chênh lệch không phải 500 triệu; cần tính cả phần cannibalization 100 triệu và chi phí phục vụ liên quan.'
        ],
        tip: 'Câu hỏi đúng không phải “khoản này có thật không?” mà là “khoản này có khác đi nếu từ chối dự án không?”.'
      },
      {
        h: '2. Chi phí chìm không quyết định tương lai',
        p: [
          'Chi phí chìm là tiền đã chi và không thể lấy lại dù chọn phương án nào từ hôm nay, ví dụ 40 triệu đã trả cho nghiên cứu thị trường tháng trước. Nó có thể giúp bạn học, nhưng không nên đưa vào NPV của quyết định tiếp tục/không tiếp tục nếu không còn thay đổi được.',
          'Con người dễ bị “đã lỡ đầu tư nhiều” kéo vào quyết định tiếp tục sai. Một dự án đã chi 500 triệu nhưng cần thêm 300 triệu để hoàn thành vẫn phải so lợi ích tương lai với 300 triệu và các chi phí tương lai, không dùng 500 triệu đã mất làm lý do tự động để chi tiếp.'
        ],
        list: [
          'Chi phí chìm: đã xảy ra, không đổi theo lựa chọn hiện tại, loại khỏi NPV tương lai.',
          'Chi phí tăng thêm: phát sinh/giảm đi do dự án, đưa vào NPV.',
          'Chi phí cơ hội: lợi ích bỏ lỡ khi dùng nguồn lực cho dự án, cũng phải đưa vào.'
        ]
      },
      {
        h: '3. Chi phí cơ hội và tác động phụ thường bị bỏ sót',
        p: [
          'Nếu dự án dùng một kho đất trống có thể cho thuê 20 triệu/năm, tiền thuê bị từ bỏ là chi phí cơ hội dù doanh nghiệp không hề trả tiền cho chính mình. Nếu dự án dùng nhân sự khan hiếm, giá trị công việc bị hoãn cũng là chi phí cần đánh giá.',
          'Tác động phụ có thể dương hoặc âm: sản phẩm mới kéo khách sang sản phẩm cũ là synergy; sản phẩm mới làm giảm doanh số sản phẩm cũ là cannibalization. Chỉ tính phần thay đổi thực, có bằng chứng, và tránh cộng lợi ích mơ hồ hai lần trong các dòng khác nhau.'
        ],
        tip: 'Tài sản đã sở hữu không phải miễn phí nếu nó có thể bán, cho thuê hoặc dùng cho phương án khác. Giá trị thay thế chính là chi phí cơ hội.'
      },
      {
        h: '4. Xây dựng bảng dòng tiền chênh lệch',
        p: [
          'Bắt đầu bằng doanh thu tăng thêm, trừ chi phí tiền mặt tăng thêm, điều chỉnh tác động lên hoạt động hiện có, tính thuế phù hợp, cộng lại khấu hao chỉ để phản ánh lá chắn thuế, rồi trừ CAPEX và đầu tư vốn lưu động. Mỗi hàng cần nguồn giả định và mốc thời gian.',
          'Không đưa chi phí tài trợ như lãi vay vào dòng tiền dự án nếu bạn đã dùng tỷ lệ chiết khấu phản ánh chi phí vốn tổng thể, vì sẽ đếm hai lần. Cách tiếp cận cụ thể tùy mô hình FCFF/FCFE; khi mới học, hãy ghi rõ loại dòng tiền và giữ nhất quán với tỷ lệ dùng.'
        ],
        list: [
          'Dòng tiền tăng thêm từ vận hành.',
          'Chi phí cơ hội và tác động phụ.',
          'CAPEX, vốn lưu động, thuế và giá trị thu hồi.',
          'Loại chi phí chìm và tránh đếm đôi chi phí tài trợ.'
        ]
      }
    ],
    keyPoints: [
      'Dòng tiền dự án là phần thay đổi khi chọn dự án so với không chọn.',
      'Chi phí chìm đã không thể thay đổi thì không quyết định NPV tương lai.',
      'Chi phí cơ hội và cannibalization là chi phí kinh tế thật cần đưa vào.',
      'Giữ nhất quán giữa loại dòng tiền và tỷ lệ chiết khấu để không đếm đôi.'
    ],
    relatedTerms: ['Dòng tiền chênh lệch', 'Stand-alone', 'Chi phí chìm', 'Chi phí cơ hội', 'Cannibalization', 'Synergy'],
    tryIt: { text: 'Phân loại bốn khoản sau thành chi phí chìm, tăng thêm hoặc cơ hội: nghiên cứu đã trả, lương tuyển mới, tiền thuê kho bỏ lỡ, máy móc đã mua năm trước.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'du-bao-dong-tien-hoat-dong-du-an',
    title: 'Bài 26 · Dự báo dòng tiền hoạt động của dự án',
    level: 'Ứng dụng',
    minutes: 32,
    chapter: 'Chương 8 · Xác định dòng tiền trong quyết định đầu tư',
    summary: 'Đi từ driver vận hành đến doanh thu, chi phí, EBIT, thuế và OCF; biết ba cách kiểm tra chéo dòng tiền để giảm lỗi mô hình.',
    sections: [
      {
        h: '1. Bắt đầu từ driver, không bắt đầu từ “doanh thu tăng 15%”',
        p: [
          'Một forecast đáng tin hơn khi doanh thu được xây từ driver: số điểm bán, khách hàng, số đơn mỗi khách, sản lượng, giá, tỷ lệ chuyển đổi hoặc công suất. Ví dụ, 100 điểm bán × 40 đơn/tháng × giá ròng 250.000 đồng tạo doanh thu 1 tỷ/tháng trước khi xét mùa vụ và chiết khấu.',
          'Driver giúp kiểm tra thực tế: 100 điểm bán có khả thi vào tháng nào, đội ngũ bán hàng có đủ không, công suất có đáp ứng không và lịch thu tiền ra sao. Một phần trăm tăng trưởng tổng hợp không trả lời được các câu hỏi này.'
        ],
        tip: 'Mỗi driver nên có đơn vị: khách, đơn/khách, kg, giờ máy, đồng/đơn. Nếu một giả định không có đơn vị, nó khó kiểm tra và dễ bị nhân sai.'
      },
      {
        h: '2. Từ doanh thu đến EBIT',
        p: [
          'Sau doanh thu, tách chi phí biến đổi như nguyên liệu, hoa hồng, vận chuyển theo đơn và chi phí cố định tăng thêm như lương đội mới, thuê mặt bằng, phần mềm. Giá vốn và chi phí vận hành cần có driver riêng, chẳng hạn tỷ lệ giá vốn/doanh thu, chi phí/đơn hoặc số nhân sự × lương đầy đủ.',
          'EBIT = doanh thu - chi phí vận hành bằng tiền - khấu hao, theo cấu trúc đơn giản. Nó là một mốc hữu ích để tính thuế và OCF nhưng không phải tiền mặt. Đừng lẫn CAPEX trong chi phí vận hành: CAPEX đi ra ở đầu tư, khấu hao phân bổ vào EBIT sau đó.'
        ],
        list: [
          'Doanh thu = giá ròng × sản lượng, có thể tách theo sản phẩm/kênh.',
          'Chi phí biến đổi = đơn giá biến đổi × sản lượng.',
          'Chi phí cố định tăng thêm = nguồn lực thực sự cần thêm vì dự án.',
          'Khấu hao = phân bổ của CAPEX, dùng cho tính thuế chứ không phải tiền chi kỳ đó.'
        ]
      },
      {
        h: '3. Ba cách kiểm tra OCF',
        p: [
          'Một cách phổ biến: OCF = EBIT × (1 - T) + khấu hao. Cách này xuất phát từ lợi nhuận hoạt động sau thuế và cộng lại chi phí không tiền mặt. Cách khác: OCF = (Doanh thu - chi phí tiền mặt) × (1 - T) + khấu hao × T, cho thấy trực tiếp lá chắn thuế khấu hao.',
          'Bạn cũng có thể đi từ EBITDA: OCF = EBITDA × (1 - T) + khấu hao × T, trong điều kiện định nghĩa nhất quán. Lập hai cách trên cùng bảng như một kiểm tra chéo. Nếu kết quả khác nhau, thường có lỗi ở dấu, thuế hoặc xử lý khấu hao.'
        ],
        tip: 'Thuế chỉ tạo dòng tiền ra khi dự án/doanh nghiệp có thu nhập chịu thuế và có thể sử dụng khoản khấu trừ. Nếu dự án lỗ, cần xem xử lý lỗ chuyển kỳ và bối cảnh thuế thực tế thay vì mặc định thuế âm thành tiền vào.'
      },
      {
        h: '4. Forecast thực tế cần ramp-up và kiểm chứng',
        p: [
          'Dự án mới hiếm khi đạt 100% công suất ngay ngày đầu. Hãy mô hình hóa ramp-up theo tháng/quý, chi phí trước vận hành, thời gian cấp phép và độ trễ thu tiền. Nếu máy lắp tháng 4 nhưng sản xuất từ tháng 6, dòng tiền bắt đầu khác với ngày ký hợp đồng.',
          'Kiểm chứng bằng capacity check, unit economics, benchmark thực tế và kịch bản downside. Ví dụ, forecast 10.000 đơn/tháng phải nhỏ hơn hoặc bằng công suất giao hàng, nhân sự hỗ trợ và nhu cầu thị trường có bằng chứng. Khi một constraint bị phá vỡ, forecast không còn đáng tin dù công thức vẫn đúng.'
        ],
        list: [
          'Tách base case, ramp-up, mùa vụ và giá/chi phí tăng theo thời gian.',
          'Kiểm tra công suất, nhân sự, khách hàng và thu tiền.',
          'Liên kết OCF với vốn lưu động, CAPEX và giá trị cuối dự án.'
        ]
      }
    ],
    keyPoints: [
      'Forecast tốt được xây từ driver có đơn vị và ràng buộc vận hành.',
      'Tách chi phí biến đổi, cố định, CAPEX và khấu hao để tránh sai dòng tiền.',
      'OCF có thể kiểm tra chéo bằng các công thức tương đương khi giả định nhất quán.',
      'Ramp-up, công suất và thời điểm thu tiền quyết định chất lượng forecast.'
    ],
    relatedTerms: ['Driver-based forecast', 'EBIT', 'EBITDA', 'OCF', 'Ramp-up', 'Unit economics'],
    tryIt: { text: 'Lập driver doanh thu cho một dịch vụ có 50 khách, 3 đơn/khách/tháng và giá ròng 400.000 đồng; ghi hai ràng buộc cần kiểm tra.', link: '/corporate-finance' },
  }),
  lesson({
    id: 'von-luu-dong-thue-va-gia-tri-thu-hoi',
    title: 'Bài 27 · Vốn lưu động, thuế và giá trị cuối dự án',
    level: 'Ứng dụng',
    minutes: 32,
    chapter: 'Chương 8 · Xác định dòng tiền trong quyết định đầu tư',
    summary: 'Hoàn thiện dòng tiền dự án bằng các khoản thường bị bỏ sót: đầu tư vốn lưu động, thu hồi cuối kỳ, giá trị thanh lý, thuế và chi phí đóng dự án.',
    sections: [
      {
        h: '1. Vốn lưu động đầu tư không phải chi phí biến mất',
        p: [
          'Khi dự án tăng doanh thu, thường cần thêm tồn kho, phải thu hoặc tiền vận hành; đồng thời có thể tăng phải trả. Phần thay đổi vốn lưu động ròng là tiền bị bỏ vào dự án ở thời điểm tăng trưởng. Nó làm giảm dòng tiền trong các năm đầu nhưng có thể được giải phóng khi dự án kết thúc hoặc quy mô giảm.',
          'Ví dụ, năm 1 dự án cần tăng phải thu 60 triệu và tồn kho 40 triệu, đồng thời phải trả tăng 25 triệu. Đầu tư vốn lưu động ròng là 60 + 40 - 25 = 75 triệu, ghi dòng tiền âm. Nếu cuối đời dự án các khoản này được thu hồi/bán hết/trả hết theo giả định, phần 75 triệu có thể quay về nhưng cần kiểm tra tính thực tế.'
        ],
        tip: 'Không dùng “vốn lưu động = x% doanh thu” rồi quên phần chênh lệch từng năm. Dòng tiền là thay đổi của số dư vốn lưu động, không phải toàn bộ số dư lặp lại mỗi năm.'
      },
      {
        h: '2. Giá trị thanh lý sau thuế',
        p: [
          'Khi bán tài sản cuối dự án, tiền thu từ bán là dòng tiền vào. Nhưng nếu giá bán khác giá trị sổ sách, có thể phát sinh thuế hoặc lợi ích thuế theo quy định áp dụng. Công thức minh họa thường viết giá trị thanh lý sau thuế = giá bán - thuế suất × (giá bán - giá trị sổ sách), với cách xử lý lỗ/lãi cần kiểm tra theo luật và khả năng sử dụng thực tế.',
          'Ví dụ, máy có giá trị sổ sách 20 triệu, bán được 50 triệu, thuế suất 20%. Lãi thanh lý là 30 triệu, thuế minh họa là 6 triệu, tiền sau thuế là 44 triệu. Nếu bán dưới giá trị sổ sách, tác động thuế có thể ngược lại, nhưng không mặc định nhận ngay tiền hoàn thuế nếu doanh nghiệp không có thu nhập chịu thuế.'
        ],
        list: [
          'Giá bán tài sản: dòng tiền thu thực tế dự kiến.',
          'Giá trị sổ sách: dùng để xác định lãi/lỗ kế toán/thuế.',
          'Thuế thanh lý: phụ thuộc quy định, tình trạng thuế và khả năng bù trừ.'
        ]
      },
      {
        h: '3. Giá trị cuối không chỉ là bán máy',
        p: [
          'Terminal cash flow có thể gồm thu hồi vốn lưu động, bán tài sản, chi phí tháo dỡ, xử lý môi trường, phí chấm dứt hợp đồng, tiền đặt cọc hoàn lại và các nghĩa vụ còn lại. Nếu dự án có thương hiệu hoặc dòng tiền kéo dài, cần mô hình hóa theo phương pháp phù hợp thay vì chèn một giá trị cuối tùy tiện.',
          'Ví dụ, đóng một cửa hàng có thể bán kệ hàng nhưng phải trả phí hoàn trả mặt bằng và chi phí tồn kho giảm giá. Chỉ đưa tiền bán thiết bị vào mà quên chi phí đóng cửa sẽ thổi phồng NPV. Người làm finance cần hỏi bộ phận vận hành và legal để có bức tranh đầy đủ.'
        ],
        tip: 'Giá trị cuối thường nhỏ về số dòng nhưng lớn về tác động NPV vì xuất hiện cùng lúc và dễ bị giả định quá lạc quan. Hãy có bằng chứng hoặc kịch bản thận trọng.'
      },
      {
        h: '4. Bảng hoàn chỉnh và kiểm tra cuối cùng',
        p: [
          'Một bảng dòng tiền dự án hoàn chỉnh thường có: CAPEX ban đầu, OCF từng kỳ, thay đổi vốn lưu động, thuế, giá trị thanh lý sau thuế, thu hồi vốn lưu động và chi phí kết thúc. Sau đó chiết khấu tất cả về kỳ 0 để tính NPV. Hãy để các hàng rõ nguồn và không trộn số kế toán với tiền mặt.',
          'Kiểm tra cực trị: nếu doanh thu bằng 0, chi phí đóng dự án còn không; nếu dự án kéo dài thêm một năm, vốn lưu động và giá trị thanh lý thay đổi ra sao; nếu không bán được tài sản, NPV có còn dương không. Những câu hỏi này biến model thành công cụ ra quyết định thật sự.'
        ],
        list: [
          'Cột 0: CAPEX, vốn lưu động ban đầu và chi phí triển khai.',
          'Các cột vận hành: OCF và thay đổi vốn lưu động theo từng kỳ.',
          'Cột cuối: thu hồi vốn lưu động, thanh lý sau thuế, chi phí kết thúc.',
          'Nhạy cảm: giá trị thanh lý, thu tiền khách và ngày dự án kết thúc.'
        ]
      }
    ],
    keyPoints: [
      'Dòng tiền vốn lưu động là thay đổi theo kỳ và thường được thu hồi cuối dự án.',
      'Thanh lý tài sản cần tính tiền thu thực tế và tác động thuế phù hợp.',
      'Giá trị cuối còn gồm chi phí đóng, hoàn tiền đặt cọc và nghĩa vụ khác.',
      'Bảng NPV hoàn chỉnh tách CAPEX, OCF, vốn lưu động, thuế và terminal cash flow.'
    ],
    relatedTerms: ['NWC', 'Thu hồi vốn lưu động', 'Giá trị thanh lý', 'Giá trị sổ sách', 'Terminal cash flow', 'Thuế thanh lý'],
    tryIt: { text: 'Tính thay đổi NWC khi phải thu tăng 50, tồn kho tăng 30 và phải trả tăng 20 triệu; nêu dòng tiền ghi ở năm đầu và năm cuối dự án.', link: '/corporate-finance' },
  }),
].slice(0, 14)

export const CORPORATE_FINANCE_FOUNDATION_PRACTICES = Object.fromEntries(
  CORPORATE_FINANCE_FOUNDATION_LESSONS.map((item) => [item.id, item.practice]),
)

// Tên export này được giữ để module ghép lộ trình có thể dùng đúng tên miền học.
export const FOUNDATION_CORPORATE_FINANCE_LESSONS = CORPORATE_FINANCE_FOUNDATION_LESSONS
export const FOUNDATION_CORPORATE_FINANCE_PRACTICES = CORPORATE_FINANCE_FOUNDATION_PRACTICES
export const CORPORATE_FINANCE_FOUNDATION_SOURCES = ACADEMIC_SOURCES
